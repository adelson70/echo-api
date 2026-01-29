import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { LogService } from 'src/modules/log/log.service';
import { LogActions, LogStatus, Modulos } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { UsuarioPayload } from '../decorators/usuario.decorator';

interface RequestWithUser extends Request {
  usuario?: UsuarioPayload;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLogInterceptor');
  constructor(private readonly logService: LogService) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const { method, originalUrl } = request;
    if (method === 'GET') return next.handle();

    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const usuario = request.usuario;
    const modulo = this.mapRouteToModule(originalUrl);
    const acao = this.mapMethodToAction(method, originalUrl);

    let data = {
      ip,
      acao,
      modulo,
      status: LogStatus.TENTATIVA,
      usuario_id: usuario ? usuario.id : null,
      metaData: this.createMetaData(request),
    };

    if (!usuario && !this.isPublicRoute(originalUrl)) {
      data.usuario_id = 'desconhecido';
    }

    const logId = await this.logService.create({ ...data });
    
    return next.handle().pipe(
      tap({
        next: async () => {
          // Sucesso
          await this.logService.updateStatus(
            logId,
            LogStatus.SUCESSO,
          );
        },
        error: async (error) => {
          // Falha
          await this.logService.updateStatus(
            logId,
            LogStatus.FALHA,
            {
              ...data.metaData,
              erro: error.message,
            },
          );
        },
      })
    )
  }

  private createMetaData(request: RequestWithUser): Record<string, any> {
    const { body, params, query } = request;
    return {
      rota: request.originalUrl,
      query,
      parametos: params,
      corpo: body,
    };
  }

  private isPublicRoute(path: string): boolean {
    const publicRoutes = ['/auth/login'];
    return publicRoutes.some((route) => path.startsWith(route));
  }

  private mapMethodToAction(method: string, originalUrl: string): LogActions {
    if (originalUrl.includes('/auth/login')) {
      return LogActions.LOGIN;
    }
    if (originalUrl.includes('/auth/logout')) {
      return LogActions.LOGOUT;
    }
    const methodMap: Record<string, LogActions> = {
      POST: LogActions.CRIAR,
      PUT: LogActions.EDITAR,
      PATCH: LogActions.EDITAR,
      DELETE: LogActions.DELETAR,
    };
    return methodMap[method.toUpperCase()];
  }

  private mapRouteToModule(path: string): Modulos | null {
    // Remove query params e trailing slash
    const cleanPath = path.split('?')[0].replace(/\/$/, '');

    // Mapeia rotas para módulos
    const routeMap: Record<string, Modulos> = {
      '/ramal': Modulos.RAMAL,
      '/tronco': Modulos.TRONCO,
      '/fila': Modulos.FILA,
      '/grupo-de-captura': Modulos.GRUPO_DE_CAPTURA,
      '/usuario': Modulos.USUARIO,
      '/relatorio': Modulos.RELATORIO,
      '/sistema': Modulos.SISTEMA,
      '/regra': Modulos.REGRA,
      '/auth': Modulos.AUTH,
    };

    // Busca correspondência exata primeiro
    for (const [route, modulo] of Object.entries(routeMap)) {
      if (cleanPath === route || cleanPath.startsWith(route + '/')) {
        return modulo;
      }
    }

    return null;
  }
}