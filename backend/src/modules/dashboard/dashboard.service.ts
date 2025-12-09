import { Injectable } from '@nestjs/common';
import { UserRepository } from '../users/user.repository';
import { AwsAccountRepository } from '../aws/repositories/aws-account.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly awsAccountRepository: AwsAccountRepository,
    private readonly usersRepository: UserRepository,
  ) {}

  async getDashboardSummary(userId: string) {
    const accounts = await this.awsAccountRepository.findByUserId(userId);
    const profile = await this.usersRepository.getProfile(userId);
    const awsOverview = await this.awsAccountRepository.getAwsOverview(userId);

    // Optional: Aggregate total cost across accounts
    const totalEstimatedCost = awsOverview.reduce(
      (sum, acc) => sum + acc.estimatedMonthlyCost,
      0,
    );

    return { profile, accounts };
  }

  async getUserProfile(userId: string) {
    return this.usersRepository.getProfile(userId);
  }

  async getAwsOverview(userId: string) {
    return this.awsAccountRepository.getAwsOverview(userId);
  }
}
