import { IsNotEmpty, IsString } from 'class-validator';

export class Enable2FADto {
  @IsString()
  @IsNotEmpty({ message: 'Password is required to enable 2FA' })
  password: string;
}
