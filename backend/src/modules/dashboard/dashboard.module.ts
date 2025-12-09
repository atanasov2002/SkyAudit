import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AwsAccountRepository } from '../aws/repositories/aws-account.repository';
import { UserRepository } from '../users/user.repository';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, AwsAccountRepository, UserRepository],
})
export class DashboardModule {}
