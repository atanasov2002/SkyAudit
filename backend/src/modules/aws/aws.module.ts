import { Module } from '@nestjs/common';
import { AwsController } from './controllers/aws.controller';
import { AwsService } from './services/aws.service';
import { AwsAccountRepository } from './repositories/aws-account.repository';
import { AwsServiceRepository } from './repositories/aws-service.repository';
import { CostAlertRepository } from './repositories/cost-alert.repository';
import { AwsCostHistoryRepository } from './repositories/aws-cost-history.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AwsController],
  providers: [
    PrismaService,
    AwsService,
    AwsAccountRepository,
    AwsServiceRepository,
    CostAlertRepository,
    AwsCostHistoryRepository,
  ],
  exports: [
    AwsService,
    AwsAccountRepository,
    AwsServiceRepository,
    CostAlertRepository,
  ],
})
export class AwsModule {}
