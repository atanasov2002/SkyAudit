import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('MICROSOFT_CLIENT_ID')!,
      clientSecret: configService.get('MICROSOFT_CLIENT_SECRET')!,
      callbackURL: configService.get('MICROSOFT_CALLBACK_URL')!,
      scope: ['user.read'],
      tenant: 'common',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any) => void,
  ): Promise<any> {
    const { displayName, emails } = profile;
    const user = {
      email: emails?.[0]?.value,
      displayName,
      accessToken,
      id: profile.id,
    };
    done(null, user);
  }
}
