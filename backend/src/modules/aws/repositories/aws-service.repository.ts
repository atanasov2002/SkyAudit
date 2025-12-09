import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, AwsService, ServiceStatus } from 'src/generated/prisma/client';

@Injectable()
export class AwsServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AwsServiceCreateInput): Promise<AwsService> {
    return this.prisma.awsService.create({ data });
  }

  async bulkCreate(
    servicesData: Prisma.AwsServiceCreateManyInput[],
  ): Promise<void> {
    await this.prisma.awsService.createMany({ data: servicesData });
  }

  async findById(id: string): Promise<AwsService | null> {
    return this.prisma.awsService.findUnique({
      where: { id },
      include: { awsAccount: true },
    });
  }

  async findByAccountId(awsAccountId: string): Promise<AwsService[]> {
    return this.prisma.awsService.findMany({
      where: { awsAccountId },
      orderBy: { currentMonthlyCost: 'desc' },
    });
  }

  async findByResourceId(
    awsAccountId: string,
    resourceId: string,
  ): Promise<AwsService | null> {
    return this.prisma.awsService.findUnique({
      where: {
        awsAccountId_resourceId: {
          awsAccountId,
          resourceId,
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.AwsServiceUpdateInput | Prisma.AwsServiceUncheckedUpdateInput,
  ): Promise<AwsService> {
    try {
      return await this.prisma.awsService.update({
        where: { id },
        data,
      });
    } catch (err) {
      throw new NotFoundException(`AWS Service with ID ${id} not found`);
    }
  }

  async updateMetrics(id: string, metrics: any): Promise<void> {
    await this.prisma.awsService.update({
      where: { id },
      data: { metrics, lastMetricsUpdate: new Date() },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.awsService.delete({ where: { id } });
  }

  async deleteByAccountId(awsAccountId: string): Promise<void> {
    await this.prisma.awsService.deleteMany({ where: { awsAccountId } });
  }

  async getTopCostServices(
    awsAccountId: string,
    limit: number = 10,
  ): Promise<AwsService[]> {
    return this.prisma.awsService.findMany({
      where: { awsAccountId },
      orderBy: { currentMonthlyCost: 'desc' },
      take: limit,
    });
  }

  async getServicesWithRecommendations(
    awsAccountId: string,
  ): Promise<AwsService[]> {
    return this.prisma.awsService.findMany({
      where: {
        awsAccountId,
        totalRecommendations: { gt: 0 },
      },
      orderBy: { potentialSavings: 'desc' },
    });
  }

  async getTotalCostByAccount(awsAccountId: string): Promise<number> {
    const result = await this.prisma.awsService.aggregate({
      where: { awsAccountId },
      _sum: { currentMonthlyCost: true },
    });
    return result._sum.currentMonthlyCost || 0;
  }

  async countByAccount(awsAccountId: string): Promise<number> {
    return this.prisma.awsService.count({ where: { awsAccountId } });
  }

  async findUnusedResources(awsAccountId: string): Promise<AwsService[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.prisma.awsService.findMany({
      where: {
        awsAccountId,
        status: ServiceStatus.STOPPED,
        lastMetricsUpdate: { lt: sevenDaysAgo },
      },
    });
  }
}
