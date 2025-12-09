import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AlertSeverity,
  AlertStatus,
  AwsCostHistory,
  CostAlert,
  Prisma,
} from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CostAlertRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CostAlertCreateInput): Promise<CostAlert> {
    return this.prisma.costAlert.create({ data });
  }

  async findById(id: string): Promise<CostAlert | null> {
    return this.prisma.costAlert.findUnique({
      where: { id },
      include: { user: true, awsAccount: true, awsService: true },
    });
  }

  async findByUserId(
    userId: string,
    status?: AlertStatus,
  ): Promise<CostAlert[]> {
    const where: any = { userId };
    if (status) where.status = status;

    return this.prisma.costAlert.findMany({
      where,
      include: { awsAccount: true, awsService: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveAlerts(userId: string): Promise<CostAlert[]> {
    return this.findByUserId(userId, AlertStatus.ACTIVE);
  }

  async findCriticalAlerts(userId: string): Promise<CostAlert[]> {
    return this.prisma.costAlert.findMany({
      where: {
        userId,
        severity: AlertSeverity.CRITICAL,
        status: AlertStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    id: string,
    data: Prisma.CostAlertUpdateInput,
  ): Promise<CostAlert> {
    try {
      return await this.prisma.costAlert.update({
        where: { id },
        data,
      });
    } catch {
      throw new NotFoundException(`Cost Alert with ID ${id} not found`);
    }
  }

  async acknowledge(id: string, userId: string): Promise<void> {
    await this.update(id, {
      status: AlertStatus.ACKNOWLEDGED,
      acknowledgedAt: new Date(),
      acknowledgedBy: userId,
    });
  }

  async resolve(id: string, userId: string, note?: string): Promise<void> {
    await this.update(id, {
      status: AlertStatus.RESOLVED,
      resolvedAt: new Date(),
      resolvedBy: userId,
      resolutionNote: note,
    });
  }

  async dismiss(id: string): Promise<void> {
    await this.update(id, { status: AlertStatus.DISMISSED });
  }

  async markNotificationSent(id: string): Promise<void> {
    await this.update(id, {
      notificationSent: true,
      notificationSentAt: new Date(),
    });
  }

  async countActiveAlerts(userId: string): Promise<number> {
    return this.prisma.costAlert.count({
      where: { userId, status: AlertStatus.ACTIVE },
    });
  }

  async getTotalPotentialSavings(userId: string): Promise<number> {
    const result = await this.prisma.costAlert.aggregate({
      where: { userId, status: AlertStatus.ACTIVE },
      _sum: { estimatedImpact: true },
    });
    return result._sum.estimatedImpact || 0;
  }

  async findAlertsNeedingNotification(): Promise<CostAlert[]> {
    return this.prisma.costAlert.findMany({
      where: { status: AlertStatus.ACTIVE, notificationSent: false },
      include: { user: true },
    });
  }
}
