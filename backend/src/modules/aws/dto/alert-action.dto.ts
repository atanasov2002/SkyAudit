import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class AcknowledgeAlertDto {
  // No body needed, just the alert ID from params
}

export class ResolveAlertDto {
  @IsString()
  @IsOptional()
  resolutionNote?: string;
}

export class DismissAlertDto {
  // No body needed
}
