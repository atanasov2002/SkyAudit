import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum ReportGranularity {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class CostReportDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ReportGranularity)
  granularity?: ReportGranularity = ReportGranularity.DAILY;
}
