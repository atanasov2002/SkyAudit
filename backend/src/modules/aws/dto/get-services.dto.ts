// dto/get-services.dto.ts
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ServiceTypeFilter {
  ALL = 'all',
  EC2 = 'ec2',
  RDS = 'rds',
  S3 = 's3',
  LAMBDA = 'lambda',
}

export enum ServiceStatusFilter {
  ALL = 'all',
  RUNNING = 'running',
  STOPPED = 'stopped',
}

export enum SortBy {
  COST = 'cost',
  NAME = 'name',
  CREATED = 'created',
  REGION = 'region',
}

export class GetServicesDto {
  @IsOptional()
  @IsEnum(ServiceTypeFilter)
  serviceType?: ServiceTypeFilter = ServiceTypeFilter.ALL;

  @IsOptional()
  @IsEnum(ServiceStatusFilter)
  status?: ServiceStatusFilter = ServiceStatusFilter.ALL;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.COST;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
