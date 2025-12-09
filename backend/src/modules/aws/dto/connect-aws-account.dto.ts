import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateIf,
  Matches,
  MinLength,
} from 'class-validator';

export class ConnectAwsAccountDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  accountName: string;

  @IsString()
  @IsOptional()
  @Matches(/^arn:aws:iam::\d{12}:role\/[\w+=,.@-]+$/, {
    message: 'Invalid IAM Role ARN format',
  })
  roleArn?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.roleArn)
  externalId?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.roleArn)
  accessKeyId?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.roleArn)
  secretAccessKey?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  regions?: string[];
}
