import { Injectable, Logger } from '@nestjs/common';
import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} from '@aws-sdk/client-cloudwatch';

@Injectable()
export class CloudWatchService {
  private readonly logger = new Logger(CloudWatchService.name);

  private client(region: string, credentials: any) {
    return new CloudWatchClient({
      region,
      credentials: credentials || undefined,
    });
  }

  private async fetchMetric(region: string, credentials: any, params: any) {
    const client = this.client(region, credentials);
    const res = await client.send(new GetMetricStatisticsCommand(params));

    return (
      res.Datapoints?.map((dp) => ({
        timestamp: dp.Timestamp,
        value: dp.Average ?? dp.Sum ?? dp.Maximum ?? dp.Minimum ?? 0,
      })) ?? []
    );
  }

  async getEc2Metrics(instanceId: string, region: string, credentials: any) {
    const now = new Date();
    const start = new Date(now.getTime() - 60 * 60 * 1000); // last 1 hour

    return {
      cpuUtilization: await this.fetchMetric(region, credentials, {
        Namespace: 'AWS/EC2',
        MetricName: 'CPUUtilization',
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
        StartTime: start,
        EndTime: now,
        Period: 300,
        Statistics: ['Average'],
      }),

      networkIn: await this.fetchMetric(region, credentials, {
        Namespace: 'AWS/EC2',
        MetricName: 'NetworkIn',
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
        StartTime: start,
        EndTime: now,
        Period: 300,
        Statistics: ['Sum'],
      }),

      networkOut: await this.fetchMetric(region, credentials, {
        Namespace: 'AWS/EC2',
        MetricName: 'NetworkOut',
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
        StartTime: start,
        EndTime: now,
        Period: 300,
        Statistics: ['Sum'],
      }),
    };
  }
}
