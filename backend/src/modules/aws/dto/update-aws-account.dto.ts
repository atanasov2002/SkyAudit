import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class UpdateAwsAccountDto {
  @IsString()
  @IsOptional()
  accountName?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  enabledRegions?: string[];

  @IsString()
  @IsOptional()
  defaultRegion?: string;

  @IsBoolean()
  @IsOptional()
  autoSync?: boolean;

  @IsInt()
  @Min(1)
  @Max(168)
  @IsOptional()
  syncIntervalHours?: number;
}
