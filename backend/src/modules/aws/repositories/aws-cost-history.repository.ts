import { Injectable } from '@nestjs/common';
import { AwsCostHistory, Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AwsCostHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.AwsCostHistoryCreateInput,
  ): Promise<AwsCostHistory> {
    return this.prisma.awsCostHistory.create({ data });
  }

  async bulkCreate(
    data: Prisma.AwsCostHistoryCreateManyInput[],
  ): Promise<void> {
    await this.prisma.awsCostHistory.createMany({ data });
  }

  async findByDateRange(
    awsAccountId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AwsCostHistory[]> {
    return this.prisma.awsCostHistory.findMany({
      where: {
        awsAccountId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  async findByServiceAndDateRange(
    awsServiceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AwsCostHistory[]> {
    return this.prisma.awsCostHistory.findMany({
      where: {
        awsServiceId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getTotalCostForPeriod(
    awsAccountId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.prisma.awsCostHistory.aggregate({
      where: {
        awsAccountId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { cost: true },
    });
    return result._sum.cost || 0;
  }

  async getLastMonthCost(awsAccountId: string): Promise<number> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    return this.getTotalCostForPeriod(awsAccountId, startDate, endDate);
  }
}
