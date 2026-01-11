import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { Request, Response } from 'express';
  import { LogService } from 'src/modules/log/log.service';
  import { LogActions, LogStatus, Modulos } from '@prisma/client';
  import { Logger } from '@nestjs/common';
  
  interface RequestWithUser extends Request {
    user?: {
      id: string;
      email?: string;
      nome?: string;
    };
    logId?: string;
  }
  
  @Injectable()
  export class AuditLogInterceptor implements NestInterceptor {
    private readonly logger = new Logger('AuditLogInterceptor');
    constructor(private readonly logService: LogService) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const response = context.switchToHttp().getResponse<Response>();
      
      const { method, originalUrl } = request;
      const ip = request.ip || request.socket.remoteAddress || 'unknown';
      const user = request.user;
  
      // Ignora rotas que não precisam de log (health check, docs, etc)
      if (this.shouldIgnoreRoute(originalUrl)) {
        return next.handle();
      }
  
      // Se não houver usuário autenticado, pula o log
      if (!user?.id) {
        return next.handle();
      }
  
      // Mapeia HTTP method para ação
      const acao = this.mapMethodToAction(method);
      
      // Se não for uma ação que precisa de log, pula
      if (!acao) {
        return next.handle();
      }
  
      // Mapeia rota para módulo
      const modulo = this.mapRouteToModule(originalUrl);
  
      // Cria log com status TENTATIVA
      let logId: string;
      
      this.logger.log(`[${method}] ${originalUrl} - IP: ${ip} - Usuário: ${user.id} - Ação: ${acao} - Módulo: ${modulo} - Status: ${LogStatus.TENTATIVA}`);
      
      this.logService
        .create({
          usuarioId: user.id,
          ip,
          status: LogStatus.TENTATIVA,
          acao,
          modulo,
          metaData: {
            method,
            path: originalUrl,
            dados_enviados: request.body || {},
            query: request.query || {},
            params: request.params || {},
          },
        })
        .then((id) => {
          logId = id;
          request.logId = id;
        })
        .catch((err) => {
          // Falha silenciosa - não queremos que o log quebre a requisição
          console.error('Erro ao criar log:', err);
        });
  
      return next.handle().pipe(
        tap({
          next: () => {
            // Sucesso - atualiza log para SUCESSO
            if (logId) {
              this.logger.log(`[${method}] ${originalUrl} - IP: ${ip} - Usuário: ${user.id} - Ação: ${acao} - Módulo: ${modulo} - Status: ${LogStatus.SUCESSO}`);
              this.logService
                .updateStatus(logId, LogStatus.SUCESSO, {
                  statusCode: response.statusCode,
                  timestamp: new Date().toISOString(),
                })
                .catch((err) => {
                  console.error('Erro ao atualizar log para sucesso:', err);
                });
            }
          },
          error: (error) => {
            // Erro - atualiza log para FALHA
            if (logId) {
              this.logService
                .updateStatus(logId, LogStatus.FALHA, {
                  statusCode: error?.status || response.statusCode || 500,
                  error: error?.message,
                  timestamp: new Date().toISOString(),
                })
                .catch((err) => {
                  console.error('Erro ao atualizar log para falha:', err);
                });
            }
          },
        }),
      );
    }
  
    private shouldIgnoreRoute(path: string): boolean {
      const ignoredRoutes = ['/docs', '/docs-json', '/health', '/log'];
      return ignoredRoutes.some((route) => path.startsWith(route));
    }
  
    private mapMethodToAction(method: string): LogActions | null {
      const methodMap: Record<string, LogActions> = {
        POST: LogActions.CRIAR,
        PUT: LogActions.EDITAR,
        PATCH: LogActions.EDITAR,
        DELETE: LogActions.DELETAR,
      };
      return methodMap[method.toUpperCase()] || null;
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
      };
  
      // Verifica rotas de regra (ordem importa: específicas primeiro, depois geral)
      if (cleanPath.startsWith('/regra/entrada')) {
        return Modulos.REGRA_DE_ENTRADA;
      }
      if (cleanPath.startsWith('/regra/saida')) {
        return Modulos.REGRA_DE_SAIDA;
      }
      if (cleanPath.startsWith('/regra')) {
        return Modulos.REGRA_GERAL;
      }
  
      // Busca correspondência exata primeiro
      for (const [route, modulo] of Object.entries(routeMap)) {
        if (cleanPath === route || cleanPath.startsWith(route + '/')) {
          return modulo;
        }
      }
  
      return null;
    }
  }