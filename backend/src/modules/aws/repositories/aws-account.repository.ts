import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AwsAccount,
  AwsAccountStatus,
  Prisma,
} from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AwsAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AwsAccountCreateInput): Promise<AwsAccount> {
    return this.prisma.awsAccount.create({ data });
  }

  async findById(id: string): Promise<AwsAccount | null> {
    return this.prisma.awsAccount.findUnique({
      where: { id },
      include: { services: true },
    });
  }

  async findByUserId(userId: string): Promise<AwsAccount[]> {
    return this.prisma.awsAccount.findMany({
      where: { userId },
      include: { services: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByAwsAccountId(awsAccountId: string) {
    return this.prisma.awsAccount.findUnique({
      where: { awsAccountId },
    });
  }

  async findActiveAccounts(userId: string): Promise<AwsAccount[]> {
    return this.prisma.awsAccount.findMany({
      where: { userId },
    });
  }

  async update(
    id: string,
    data: Prisma.AwsAccountUpdateInput,
  ): Promise<AwsAccount> {
    try {
      return await this.prisma.awsAccount.update({
        where: {
          id,
        },
        data,
      });
    } catch (err: any) {
      console.log(err);
      throw new NotFoundException(`AWS Account with ID ${id} not found`);
    }
  }

  async updateStatus(
    id: string,
    status: AwsAccountStatus,
    errorMessage?: string,
  ): Promise<void> {
    await this.update(id, {
      status,
      errorMessage,
      lastHealthCheck: new Date(),
    });
  }

  async updateLastSync(id: string): Promise<void> {
    await this.update(id, { lastSyncedAt: new Date() });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.awsAccount.delete({ where: { id } });
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.awsAccount.count({ where: { userId } });
  }

  async findAccountsNeedingSync(): Promise<AwsAccount[]> {
    return this.prisma.awsAccount.findMany({
      where: {
        autoSync: true,
        status: AwsAccountStatus.ACTIVE,
        OR: [
          { lastSyncedAt: null },
          { lastSyncedAt: { lt: new Date(Date.now() - 1000 * 60 * 60) } }, // simplistic sync interval example
        ],
      },
    });
  }
  async getAwsOverview(userId: string) {
    const accounts = await this.prisma.awsAccount.findMany({
      where: { userId },
      include: {
        services: true,
        costAlerts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return accounts.map((account) => ({
      id: account.id,
      name: account.accountName,
      awsAccountId: account.awsAccountId,
      status: account.status,
      totalServices: account.services.length,
      estimatedMonthlyCost: account.estimatedMonthlyCost,
      activeAlerts: account.costAlerts.filter((a) => a.status === 'ACTIVE')
        .length,
      lastSyncedAt: account.lastSyncedAt,
    }));
  }
}
