import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

@Injectable()
export class LogRouteInterceptor implements NestInterceptor {
  private readonly logger = new Logger('RouteLogger');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, originalUrl } = request;
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = response.statusCode;
          const duration = Date.now() - startTime;
          this.logRoute(method, originalUrl, statusCode, duration, ip, 'success');
        },
        error: (error) => {
          const statusCode = error?.status || response.statusCode || 500;
          const duration = Date.now() - startTime;
          this.logRoute(method, originalUrl, statusCode, duration, ip, 'error', error?.message);
        },
      }),
    );
  }

  private logRoute(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    ip: string,
    type: 'success' | 'error',
    errorMessage?: string,
  ): void {
    const statusEmoji = this.getStatusEmoji(statusCode);
    const typeEmoji = type === 'success' ? '✅' : '❌';
    const methodColor = this.getMethodColor(method);

    const logMessage = `${typeEmoji} [${methodColor}] ${method.padEnd(6)} ${path} - ${statusEmoji} ${statusCode} - ${duration}ms - IP: ${ip}`;

    if (type === 'error') {
      this.logger.error(`${logMessage}${errorMessage ? ` - Erro: ${errorMessage}` : ''}`);
    } else if (statusCode >= 200 && statusCode < 300) {
      this.logger.log(logMessage);
    } else if (statusCode >= 300 && statusCode < 400) {
      this.logger.warn(logMessage);
    } else {
      this.logger.error(logMessage);
    }
  }

  private getStatusEmoji(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '✓';
    if (statusCode >= 300 && statusCode < 400) return '↪';
    if (statusCode >= 400 && statusCode < 500) return '⚠';
    return '✗';
  }

  private getMethodColor(method: string): string {
    const colors: Record<string, string> = {
      GET: '\x1b[36m', // Cyan
      POST: '\x1b[32m', // Green
      PUT: '\x1b[33m', // Yellow
      PATCH: '\x1b[35m', // Magenta
      DELETE: '\x1b[31m', // Red
    };
    return `${colors[method.toUpperCase()] || ''}${method}\x1b[0m`;
  }
}
