import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class Verify2FADto {
  // @IsString()
  // @IsNotEmpty({ message: '2FA token is required' })
  // @Length(6, 6, { message: '2FA token must be 6 digits' })
  // token: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
