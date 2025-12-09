import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtCookieAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    // Read JWT from cookie and set Authorization header for Passport
    if (req.cookies?.accessToken) {
      req.headers.authorization = `Bearer ${req.cookies.accessToken}`;
    }
    return req;
  }
  handleRequest(err, user, info, ctx) {
    const req = ctx.switchToHttp().getRequest();

    const token = req.cookies?.accessToken;
    if (!token) throw new UnauthorizedException();

    return user;
  }
}
