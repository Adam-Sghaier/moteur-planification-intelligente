import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Debug: Log the authorization header
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log('🔐 Authorization Header:', authHeader ? authHeader.substring(0, 50) + '...' : 'MISSING');

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Debug: Log any errors
    if (err || !user) {
      console.log('❌ JWT Error:', info?.message || err?.message || 'Unknown error');
      throw err || new UnauthorizedException();
    }
    console.log('✅ JWT Valid - User:', user.email);
    return user;
  }
}
