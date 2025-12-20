import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  STSClient,
  AssumeRoleCommand,
  GetCallerIdentityCommand,
} from '@aws-sdk/client-sts';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds';
import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda';
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from '@aws-sdk/client-cost-explorer';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { AwsAccountRepository } from '../repositories/aws-account.repository';
import { AwsServiceRepository } from '../repositories/aws-service.repository';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { CloudWatchService } from 'src/modules/cloudwatch/cloudwatch.service';
import { AwsAccount } from 'src/generated/prisma/client';
import {
  AwsServiceModel,
  AwsServiceWhereInput,
} from 'src/generated/prisma/models';
import {
  SupportClient,
  DescribeTrustedAdvisorChecksCommand,
  DescribeTrustedAdvisorCheckResultCommand,
} from '@aws-sdk/client-support';
import {
  ComputeOptimizerClient,
  GetEC2InstanceRecommendationsCommand,
} from '@aws-sdk/client-compute-optimizer';

@Injectable()
export class AwsService {
  private readonly logger = new Logger(AwsService.name);
  private readonly encryptionKey: string;

  constructor(
    private awsAccountRepository: AwsAccountRepository,
    private awsServiceRepository: AwsServiceRepository,
    private configService: ConfigService,
    private readonly cloudWatchService: CloudWatchService,
  ) {
    this.encryptionKey = this.configService.get('ENCRYPTION_KEY')!;
  }

  async getServiceWithMetrics(
    req: RequestWithUser,
    accountId: string,
    serviceId: string,
  ) {
    const account =
      await this.awsAccountRepository.findByAwsAccountId(accountId);

    if (!account || account.userId !== req.user.id) {
      return {
        statusCode: 404,
        message: 'AWS account not found',
      };
    }
    const service = await this.awsServiceRepository.findById(serviceId);

    if (!service || service.awsAccountId !== account.id)
      throw new NotFoundException('Service not found');

    if (service.isMonitored && service.serviceType === 'EC2') {
      const account = await this.awsAccountRepository.findById(
        service.awsAccountId,
      );
      const credentials = await this.getCredentials(account!);

      const metrics = await this.cloudWatchService.getEc2Metrics(
        service.resourceId,
        service.region,
        credentials,
      );

      await this.awsServiceRepository.updateMetrics(service.id, metrics);

      return {
        ...service,
        metrics,
      };
    }

    return service;
  }

  /**
   * Verify AWS credentials and get account information
   */
  async verifyCredentials(
    roleArn?: string,
    externalId?: string,
  ): Promise<{ accountId: string; arn: string; userId: string }> {
    try {
      let stsClient: STSClient;

      if (roleArn && externalId) {
        // Assume role using backend credentials
        const baseStsClient = new STSClient({ region: 'eu-north-1' }); // uses backend env credentials

        const assumeRoleCommand = new AssumeRoleCommand({
          RoleArn: roleArn,
          RoleSessionName: 'SkyAuditSession',
          ExternalId: externalId,
          DurationSeconds: 3600,
        });

        const response = await baseStsClient.send(assumeRoleCommand);

        const creds: AwsCredentialIdentity = {
          accessKeyId: response.Credentials!.AccessKeyId!,
          secretAccessKey: response.Credentials!.SecretAccessKey!,
          sessionToken: response.Credentials!.SessionToken!,
        };

        stsClient = new STSClient({
          region: 'us-east-2',
          credentials: creds,
        });
      } else {
        // No role — use backend credentials
        stsClient = new STSClient({ region: 'eu-north-1' });
      }

      const identity = await stsClient.send(new GetCallerIdentityCommand({}));

      return {
        accountId: identity.Account!,
        arn: identity.Arn!,
        userId: identity.UserId!,
      };
    } catch (error) {
      this.logger.error('Failed to verify AWS credentials', error);
      throw new BadRequestException('Invalid AWS credentials');
    }
  }

  /**
   * Connect a new AWS account
   */
  async connectAccount(
    userId: string,
    accountName: string,
    roleArn?: string,
    externalId?: string,
    regions: string[] = ['us-east-2'],
  ) {
    // Verify credentials first
    const identity = await this.verifyCredentials(roleArn, externalId);

    // Check if account already exists
    const existing = await this.awsAccountRepository.findByAwsAccountId(
      identity.accountId,
    );
    if (existing) {
      throw new BadRequestException('This AWS account is already connected');
    }

    // Create account record
    const account = await this.awsAccountRepository.create({
      user: { connect: { id: userId } },
      accountName,
      awsAccountId: identity.accountId,
      roleArn,
      externalId,
      defaultRegion: regions[0],
      enabledRegions: regions,
      status: 'ACTIVE',
      credentialType: roleArn ? ('IAM_ROLE' as any) : ('IAM_USER' as any),
    });

    this.logger.log(
      `AWS account connected: ${accountName} (${identity.accountId})`,
    );

    // Trigger initial sync in background
    this.syncAccount(account.id).catch((err) =>
      this.logger.error('Failed to sync account', err),
    );

    return account;
  }

  /**
   * Sync AWS account - discover all resources
   */
  async syncAccount(accountId: string): Promise<void> {
    const account =
      await this.awsAccountRepository.findByAwsAccountId(accountId);
    if (!account) {
      throw new NotFoundException('AWS account not found');
    }

    this.logger.log(`Starting sync for account: ${account.accountName}`);

    try {
      const credentials = await this.getCredentials(account);

      // Discover services in parallel
      const [ec2Instances, s3Buckets, rdsInstances, lambdaFunctions] =
        await Promise.allSettled([
          this.discoverEC2Instances(
            credentials,
            account.enabledRegions,
            account.awsAccountId,
          ),
          this.discoverS3Buckets(credentials, account.awsAccountId),
          this.discoverRDSInstances(
            credentials,
            account.enabledRegions,
            account.awsAccountId,
          ),
          this.discoverLambdaFunctions(
            credentials,
            account.enabledRegions,
            account.awsAccountId,
          ),
        ]);

      // Save discovered services
      const services: any[] = [];

      if (ec2Instances.status === 'fulfilled') {
        services.push(...ec2Instances.value);
      }
      if (s3Buckets.status === 'fulfilled') {
        services.push(...s3Buckets.value);
      }
      if (rdsInstances.status === 'fulfilled') {
        services.push(...rdsInstances.value);
      }
      if (lambdaFunctions.status === 'fulfilled') {
        services.push(...lambdaFunctions.value);
      }

      // Add awsAccountId to all services
      const servicesWithAccountId = services.map((service) => ({
        ...service,
        awsAccountId: account.id,
      }));

      // Delete old services and insert new ones
      await this.awsServiceRepository.deleteByAccountId(account.awsAccountId);
      if (servicesWithAccountId.length > 0) {
        await this.awsServiceRepository.bulkCreate(servicesWithAccountId);
      }

      // Update account
      await this.awsAccountRepository.update(account.id, {
        totalServices: servicesWithAccountId.length,
        lastSyncedAt: new Date(),
        status: 'ACTIVE' as any,
      });

      this.logger.log(
        `Sync completed for ${account.accountName}: ${servicesWithAccountId.length} services discovered`,
      );
    } catch (error) {
      this.logger.error(`Sync failed for ${account.accountName}`, error);
      await this.awsAccountRepository.updateStatus(
        account.id,
        'ERROR' as any,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Get AWS credentials for an account
   */
  private async getCredentials(account: AwsAccount): Promise<any> {
    if (account.roleArn) {
      const stsClient = new STSClient({ region: account.defaultRegion });
      const command = new AssumeRoleCommand({
        RoleArn: account.roleArn,
        RoleSessionName: 'SkyAuditSession',
        ExternalId: account.externalId!,
        DurationSeconds: 3600,
      });
      const response = await stsClient.send(command);
      return {
        accessKeyId: response.Credentials!.AccessKeyId,
        secretAccessKey: response.Credentials!.SecretAccessKey,
        sessionToken: response.Credentials!.SessionToken,
      };
    } else {
      return undefined;
    }
  }

  /**
   * Discover EC2 instances
   */
  private async discoverEC2Instances(
    credentials: any,
    regions: string[],
    awsAccountId: string,
  ): Promise<any[]> {
    const instances: any[] = [];

    for (const region of regions) {
      try {
        const client = new EC2Client({ region, credentials });
        const command = new DescribeInstancesCommand({});
        const response = await client.send(command);

        for (const reservation of response.Reservations || []) {
          for (const instance of reservation.Instances || []) {
            const tags = instance.Tags?.reduce(
              (acc, tag) => {
                acc[tag.Key!] = tag.Value!;
                return acc;
              },
              {} as Record<string, string>,
            );

            instances.push({
              serviceType: 'EC2',
              serviceName: tags?.Name || instance.InstanceId,
              resourceId: instance.InstanceId,
              resourceArn: `arn:aws:ec2:${region}:${awsAccountId}:instance/${instance.InstanceId}`,
              region,
              status: this.mapEC2Status(instance.State?.Name),
              configuration: {
                instanceType: instance.InstanceType,
                availabilityZone: instance.Placement?.AvailabilityZone,
                vpcId: instance.VpcId,
                subnetId: instance.SubnetId,
                securityGroups: instance.SecurityGroups?.map(
                  (sg) => sg.GroupId,
                ),
              },
              tags,
              launchTime: instance.LaunchTime,
            });
          }
        }
      } catch (error) {
        this.logger.error(`Failed to discover EC2 in ${region}`, error);
      }
    }

    return instances;
  }

  /**
   * Discover S3 buckets
   */
  private async discoverS3Buckets(
    credentials: any,
    awsAccountId: string,
  ): Promise<any[]> {
    const buckets: any[] = [];

    try {
      const client = new S3Client({ region: 'eu-north-1', credentials });
      const command = new ListBucketsCommand({});
      const response = await client.send(command);

      for (const bucket of response.Buckets || []) {
        buckets.push({
          serviceType: 'S3',
          serviceName: bucket.Name,
          resourceId: bucket.Name,
          resourceArn: `arn:aws:s3:::${bucket.Name}`,
          region: 'eu-north-1',
          status: 'RUNNING',
          configuration: {
            creationDate: bucket.CreationDate,
          },
          launchTime: bucket.CreationDate,
        });
      }
    } catch (error) {
      this.logger.error('Failed to discover S3 buckets', error);
    }

    return buckets;
  }

  /**
   * Discover RDS instances
   */
  private async discoverRDSInstances(
    credentials: any,
    regions: string[],
    awsAccountId: string,
  ): Promise<any[]> {
    const instances: any[] = [];

    for (const region of regions) {
      try {
        const client = new RDSClient({ region, credentials });
        const command = new DescribeDBInstancesCommand({});
        const response = await client.send(command);

        for (const instance of response.DBInstances || []) {
          instances.push({
            serviceType: 'RDS',
            serviceName: instance.DBInstanceIdentifier,
            resourceId: instance.DBInstanceIdentifier,
            resourceArn: instance.DBInstanceArn,
            region,
            status: this.mapRDSStatus(instance.DBInstanceStatus),
            configuration: {
              instanceType: instance.DBInstanceClass,
              engine: instance.Engine,
              version: instance.EngineVersion,
              storageSize: instance.AllocatedStorage,
              availabilityZone: instance.AvailabilityZone,
              multiAZ: instance.MultiAZ,
            },
            launchTime: instance.InstanceCreateTime,
          });
        }
      } catch (error) {
        this.logger.error(`Failed to discover RDS in ${region}`, error);
      }
    }

    return instances;
  }

  /**
   * Discover Lambda functions
   */
  private async discoverLambdaFunctions(
    credentials: any,
    regions: string[],
    awsAccountId: string,
  ): Promise<any[]> {
    const functions: any[] = [];

    for (const region of regions) {
      try {
        const client = new LambdaClient({ region, credentials });
        const command = new ListFunctionsCommand({});
        const response = await client.send(command);

        for (const func of response.Functions || []) {
          functions.push({
            serviceType: 'LAMBDA',
            serviceName: func.FunctionName,
            resourceId: func.FunctionName,
            resourceArn: func.FunctionArn,
            region,
            status: 'RUNNING',
            configuration: {
              runtime: func.Runtime,
              memorySize: func.MemorySize,
              timeout: func.Timeout,
              codeSize: func.CodeSize,
            },
            launchTime: new Date(func.LastModified!),
          });
        }
      } catch (error) {
        this.logger.error(`Failed to discover Lambda in ${region}`, error);
      }
    }

    return functions;
  }

  /**
   * Disconnect AWS account
   */
  async disconnectAccount(accountId: string, userId: string): Promise<void> {
    const account = await this.awsAccountRepository.findById(accountId);
    if (!account || account.userId !== userId) {
      throw new NotFoundException('AWS account not found');
    }

    await this.awsAccountRepository.delete(accountId);
    this.logger.log(`AWS account disconnected: ${account.accountName}`);
  }

  // Helper methods
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey, 'hex'),
      iv,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  private decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey, 'hex'),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  private mapEC2Status(state?: string): string {
    const statusMap: Record<string, string> = {
      running: 'RUNNING',
      stopped: 'STOPPED',
      pending: 'PENDING',
      'shutting-down': 'STOPPED',
      terminated: 'TERMINATED',
      stopping: 'STOPPED',
    };
    return statusMap[state || ''] || 'unknown';
  }

  private mapRDSStatus(status?: string): string {
    const statusMap: Record<string, string> = {
      available: 'RUNNING',
      stopped: 'STOPPED',
      starting: 'PENDING',
      stopping: 'STOPPED',
      creating: 'PENDING',
      deleting: 'TERMINATED',
    };
    return statusMap[status || ''] || 'unknown';
  }

  /**
   * Get Trusted Advisor cost optimization recommendations
   */
  async getTrustedAdvisorRecommendations(account: any): Promise<any[]> {
    const credentials = await this.getCredentials(account);

    const supportClient = new SupportClient({
      region: 'us-east-1', // Trusted Advisor only in us-east-1
      credentials,
    });

    const checksResp = await supportClient.send(
      new DescribeTrustedAdvisorChecksCommand({ language: 'en' }),
    );

    const costChecks = (checksResp.checks || []).filter(
      (c) => c.category === 'cost_optimization',
    );

    const recommendations: any[] = [];

    for (const check of costChecks) {
      const result = await supportClient.send(
        new DescribeTrustedAdvisorCheckResultCommand({ checkId: check.id! }),
      );

      for (const resource of result.result?.flaggedResources || []) {
        recommendations.push({
          serviceName: resource.metadata?.[0] || 'Unknown',
          resourceId: resource.resourceId,
          recommendation: resource.metadata?.[2] || '',
          severity: 'high', // you can map based on resource.status
          potentialSavings: Number(resource.metadata?.[1] || 0),
          source: 'TrustedAdvisor',
        });
      }
    }

    return recommendations;
  }

  /**
   * Get Compute Optimizer recommendations for EC2
   */
  async getComputeOptimizerRecommendations(account: any): Promise<any[]> {
    const credentials = await this.getCredentials(account);

    const optimizerClient = new ComputeOptimizerClient({
      region: 'us-east-1',
      credentials,
    });

    const recsResp = await optimizerClient.send(
      new GetEC2InstanceRecommendationsCommand({}),
    );

    return (recsResp.instanceRecommendations || []).map((r) => ({
      serviceName: r.instanceName,
      resourceId: r.instanceArn,
      recommendation: r.recommendationOptions?.[0]?.performanceRisk,
      severity: 'medium',
      potentialSavings: r.findingReasonCodes?.length || 0,
      source: 'ComputeOptimizer',
    }));
  }
}
