import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Observable } from 'rxjs';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private rateLimiter = new RateLimiterMemory({
    points: parseInt(process.env.RATE_LIMIT_POINTS || '500'), 
    duration: parseInt(process.env.RATE_LIMIT_DURATION || '60'), 
    blockDuration: parseInt(process.env.RATE_LIMIT_BLOCK_DURATION || '300'), 
  });

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<{ ip?: string }>();

    const ip = request?.ip;
    if (!ip) return false;

    return this.rateLimiter
      .consume(ip)
      .then(() => true)
      .catch(() => false);
  }
}
