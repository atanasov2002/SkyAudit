import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AwsService } from '../services/aws.service';
import { AwsAccountRepository } from '../repositories/aws-account.repository';
import { AwsServiceRepository } from '../repositories/aws-service.repository';
import { CostAlertRepository } from '../repositories/cost-alert.repository';
import { ConnectAwsAccountDto } from '../dto/connect-aws-account.dto';
import { UpdateAwsAccountDto } from '../dto/update-aws-account.dto';
import { GetServicesDto } from '../dto/get-services.dto';
import { ResolveAlertDto } from '../dto/alert-action.dto';
import { ServiceStatus } from 'src/generated/prisma/client';
import { JwtCookieAuthGuard } from 'src/modules/auth/guards/jwt-cookie-auth.guard';
import { log } from 'node:console';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    failedLoginAttempts: number;
    accountLockedUntil: Date | null;
    lastLoginAt: Date | null;
    lastLoginIp: string | null;
    oauthProvider: string | null;
    oauthId: string | null;
    profilePictureUrl: string | null;
    twoFactorEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Controller('api/aws')
@UseGuards(JwtCookieAuthGuard)
export class AwsController {
  constructor(
    private readonly awsService: AwsService,
    private readonly awsAccountRepository: AwsAccountRepository,
    private readonly awsServiceRepository: AwsServiceRepository,
    private readonly costAlertRepository: CostAlertRepository,
  ) {}

  // ==================== AWS Accounts ====================

  @Post('accounts')
  @HttpCode(HttpStatus.CREATED)
  async connectAccount(
    @Req() req: RequestWithUser,
    @Body() connectDto: ConnectAwsAccountDto,
  ) {
    const userId = req.user.id;

    const account = await this.awsService.connectAccount(
      req.user.id,
      connectDto.accountName,
      connectDto.roleArn,
      connectDto.externalId,
      connectDto.regions || ['eu-north-1'],
    );

    return {
      message: 'AWS account connected successfully',
      account: {
        id: account.id,
        accountName: account.accountName,
        awsAccountId: account.awsAccountId,
        status: account.status,
        enabledRegions: account.enabledRegions,
      },
    };
  }

  @Get('accounts')
  async getAccounts(@Req() req: RequestWithUser) {
    const accounts = await this.awsAccountRepository.findByUserId(req.user.id);

    return {
      message: 'AWS accounts retrieved successfully',
      accounts: accounts.map((account) => ({
        id: account.id,
        accountName: account.accountName,
        awsAccountId: account.awsAccountId,
        status: account.status,
        totalServices: account.totalServices,
        estimatedMonthlyCost: account.estimatedMonthlyCost,
        lastSyncedAt: account.lastSyncedAt,
        enabledRegions: account.enabledRegions,
        createdAt: account.createdAt,
      })),
      total: accounts.length,
    };
  }

  @Get('accounts/:accountId')
  async getAccount(
    @Req() req: RequestWithUser,
    @Param('accountId') accountId: string,
  ) {
    const account =
      await this.awsAccountRepository.findByAwsAccountId(accountId);

    if (!account || account.userId !== req.user.id) {
      return {
        statusCode: 404,
        message: 'AWS account not found',
      };
    }

    const totalCost =
      await this.awsServiceRepository.getTotalCostByAccount(accountId);

    return {
      message: 'AWS account retrieved successfully',
      account: {
        ...account,
        totalCost,
      },
    };
  }

  @Put('accounts/:accountId')
  async updateAccount(
    @Req() req: RequestWithUser,
    @Param('accountId') accountId: string,
    @Body() updateDto: UpdateAwsAccountDto,
  ) {
    const account = await this.awsAccountRepository.findById(accountId);

    if (!account || account.userId !== req.user.id) {
      return {
        statusCode: 404,
        message: 'AWS account not found',
      };
    }

    const updated = await this.awsAccountRepository.update(
      accountId,
      updateDto,
    );

    return {
      message: 'AWS account updated successfully',
      account: updated,
    };
  }

  @Delete('accounts/:accountId')
  @HttpCode(HttpStatus.OK)
  async disconnectAccount(
    @Req() req: RequestWithUser,
    @Param('accountId') accountId: string,
  ) {
    await this.awsService.disconnectAccount(accountId, req.user.id);

    return {
      message: 'AWS account disconnected successfully',
    };
  }

  @Post('accounts/:accountId/sync')
  @HttpCode(HttpStatus.OK)
  async syncAccount(
    @Req() req: RequestWithUser,
    @Param('accountId') accountId: string,
  ) {
    const account =
      await this.awsAccountRepository.findByAwsAccountId(accountId);

    if (!account || account.userId !== req.user.id) {
      return {
        statusCode: 404,
        message: 'AWS account not found',
      };
    }

    // Trigger sync in background
    this.awsService.syncAccount(accountId).catch((err) => {
      console.error('Sync failed:', err);
    });

    return {
      message: 'Sync started. This may take a few minutes.',
    };
  }

  // ==================== AWS Services ====================

  @Get('accounts/:accountId/services')
  async getServices(
    @Req() req: RequestWithUser,
    @Param('accountId') accountId: string,
    @Query() query: GetServicesDto,
  ) {
    const account =
      await this.awsAccountRepository.findByAwsAccountId(accountId);

    if (!account || account.userId !== req.user.id) {
      return {
        statusCode: 404,
        message: 'AWS account not found',
      };
    }

    const services = await this.awsServiceRepository.findByAccountId(
      account.id,
    );

    // Apply filters
    let filtered = services;

    if (query.serviceType && query.serviceType !== 'all') {
      filtered = filtered.filter(
        (s) =>
          s.serviceType.toLocaleLowerCase() ===
          query.serviceType?.toLocaleLowerCase(),
      );
    }

    if (query.status && query.status !== 'all') {
      filtered = filtered.filter(
        (s) =>
          s.status.toLocaleLowerCase() === query.status?.toLocaleLowerCase(),
      );
    }

    if (query.region) {
      filtered = filtered.filter((s) => s.region === query.region);
    }

    if (query.search) {
      const search = query.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.serviceName.toLowerCase().includes(search) ||
          s.resourceId.toLowerCase().includes(search),
      );
    }

    // Sort
    if (query.sortBy === 'cost') {
      filtered.sort((a, b) => b.currentMonthlyCost - a.currentMonthlyCost);
    } else if (query.sortBy === 'name') {
      filtered.sort((a, b) => a.serviceName.localeCompare(b.serviceName));
    }

    // Paginate
    const page = query.page || 1;
    const limit = query.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      message: 'Services retrieved successfully',
      services: paginated,
      pagination: {
        total: filtered.length,
        page,
        limit,
        pages: Math.ceil(filtered.length / limit),
      },
    };
  }

  @Get('accounts/:accountId/services/:serviceId')
  async getService(
    @Req() req: RequestWithUser,
    @Param('accountId') accountId: string,
    @Param('serviceId') serviceId: string,
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

    if (!service || service.awsAccountId !== account.id) {
      return {
        statusCode: 404,
        message: 'Service not found',
      };
    }

    return {
      message: 'Service retrieved successfully',
      service,
    };
  }

  // ==================== Cost & Analytics ====================

  @Get('accounts/:accountId/cost-summary')
  async getCostSummary(
    @Req() req: RequestWithUser,
    @Param('accountId') accountId: string,
  ) {
    const account =
      await this.awsAccountRepository.findByAwsAccountId(accountId);

    if (!account || account.userId !== req.user.id) {
      return {
        statusCode: 404,
        message: 'AWS account not found',
      };
    }

    const services = await this.awsServiceRepository.findByAccountId(accountId);
    const totalCost = services.reduce(
      (sum, s) => sum + +s.currentMonthlyCost,
      0,
    );
    const totalLastMonth = services.reduce(
      (sum, s) => sum + +s.lastMonthCost,
      0,
    );
    const costChange =
      totalLastMonth > 0
        ? ((totalCost - totalLastMonth) / totalLastMonth) * 100
        : 0;

    // Group by service type
    const costByServiceType = services.reduce(
      (acc, service) => {
        const type = service.serviceType;
        acc[type] = (acc[type] || 0) + +service.currentMonthlyCost;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Top 5 most expensive services
    const topServices = services
      .sort((a, b) => +b.currentMonthlyCost - +a.currentMonthlyCost)
      .slice(0, 5)
      .map((s) => ({
        name: s.serviceName,
        type: s.serviceType,
        cost: s.currentMonthlyCost,
      }));

    return {
      message: 'Cost summary retrieved successfully',
      summary: {
        totalCurrentCost: totalCost,
        totalLastMonthCost: totalLastMonth,
        costChange,
        totalServices: services.length,
        runningServices: services.filter(
          (s) => s.status === ServiceStatus.RUNNING,
        ).length,
        costByServiceType,
        topServices,
      },
    };
  }

  @Get('accounts/:accountId/recommendations')
  async getRecommendations(
    @Req() req: RequestWithUser,
    @Param('accountId') accountId: string,
  ) {
    const account =
      await this.awsAccountRepository.findByAwsAccountId(accountId);

    if (!account || account.userId !== req.user.id) {
      return {
        statusCode: 404,
        message: 'AWS account not found',
      };
    }

    const servicesWithRecs =
      await this.awsServiceRepository.getServicesWithRecommendations(accountId);

    const allRecommendations = servicesWithRecs.flatMap((service) =>
      ((service.recommendations as any[]) || []).map((rec) => ({
        ...rec,
        serviceName: service.serviceName,
        serviceType: service.serviceType,
        serviceId: service.id,
      })),
    );

    // Sort by severity and potential savings
    allRecommendations.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff =
        severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return (b.potentialSavings || 0) - (a.potentialSavings || 0);
    });

    const totalPotentialSavings = allRecommendations.reduce(
      (sum, rec) => sum + (rec.potentialSavings || 0),
      0,
    );

    return {
      message: 'Recommendations retrieved successfully',
      recommendations: allRecommendations,
      summary: {
        total: allRecommendations.length,
        critical: allRecommendations.filter((r) => r.severity === 'critical')
          .length,
        high: allRecommendations.filter((r) => r.severity === 'high').length,
        totalPotentialSavings,
      },
    };
  }

  // ==================== Alerts ====================

  @Get('alerts')
  async getAlerts(
    @Req() req: RequestWithUser,
    @Query('status') status?: string,
  ) {
    const alerts = await this.costAlertRepository.findByUserId(
      req.user.id,
      status as any,
    );

    return {
      message: 'Alerts retrieved successfully',
      alerts,
      total: alerts.length,
    };
  }

  @Post('alerts/:alertId/acknowledge')
  @HttpCode(HttpStatus.OK)
  async acknowledgeAlert(
    @Req() req: RequestWithUser,
    @Param('alertId') alertId: string,
  ) {
    await this.costAlertRepository.acknowledge(alertId, req.user.id);

    return {
      message: 'Alert acknowledged',
    };
  }

  @Post('alerts/:alertId/resolve')
  @HttpCode(HttpStatus.OK)
  async resolveAlert(
    @Req() req: RequestWithUser,
    @Param('alertId') alertId: string,
    @Body() body: ResolveAlertDto,
  ) {
    await this.costAlertRepository.resolve(
      alertId,
      req.user.id,
      body.resolutionNote,
    );

    return {
      message: 'Alert resolved',
    };
  }

  @Post('alerts/:alertId/dismiss')
  @HttpCode(HttpStatus.OK)
  async dismissAlert(
    @Req() req: RequestWithUser,
    @Param('alertId') alertId: string,
  ) {
    await this.costAlertRepository.dismiss(alertId);

    return {
      message: 'Alert dismissed',
    };
  }

  // ==================== Dashboard Overview ====================

  @Get('dashboard')
  async getDashboard(@Req() req: RequestWithUser) {
    const accounts = await this.awsAccountRepository.findActiveAccounts(
      req.user.id,
    );

    const alerts = await this.costAlertRepository.findActiveAlerts(req.user.id);
    const criticalAlerts = await this.costAlertRepository.findCriticalAlerts(
      req.user.id,
    );

    let totalCost = 0;
    let totalServices = 0;

    for (const account of accounts) {
      const cost = await this.awsServiceRepository.getTotalCostByAccount(
        account.id,
      );
      totalCost += cost;
      totalServices += account.totalServices;
    }

    const potentialSavings =
      await this.costAlertRepository.getTotalPotentialSavings(req.user.id);

    return {
      message: 'Dashboard data retrieved successfully',
      dashboard: {
        totalAccounts: accounts.length,
        totalServices,
        totalMonthlyCost: totalCost,
        activeAlerts: alerts.length,
        criticalAlerts: criticalAlerts.length,
        potentialSavings,
        accounts: accounts.map((acc) => ({
          id: acc.id,
          name: acc.accountName,
          status: acc.status,
          totalServices: acc.totalServices,
          awsAccountId: acc.awsAccountId,
        })),
        recentAlerts: alerts.slice(0, 5),
      },
    };
  }
}
