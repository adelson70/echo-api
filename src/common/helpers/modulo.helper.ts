import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { Modulos, LogActions } from "@prisma/client";
import { MODULO_KEY } from "../decorators/modulo.decorator";

/**
 * Obtém o módulo seguindo a ordem de prioridade:
 * 1. Decorator @Modulo() na rota
 * 2. Mapeamento por rota (fallback)
 */
export function getModulo(
  context: ExecutionContext,
  reflector: Reflector,
  request: Request
): Modulos | null {
  // 1. Tenta obter do decorator na rota (prioridade máxima)
  const decoratorModulo = reflector.getAllAndOverride<Modulos>(MODULO_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);
  if (decoratorModulo) {
    return decoratorModulo;
  }

  // 2. Fallback: mapeia pela rota
  return mapRouteToModule(request.originalUrl);
}

/**
 * Obtém o tipo de acesso da rota baseado no método HTTP
 * Retorna uma string descritiva do tipo de acesso
 */
export function getTipoAcesso(method: string): string | null {
  const methodMap: Record<string, string> = {
    GET: 'ler',
    POST: 'criar',
    PUT: 'editar',
    PATCH: 'editar',
    DELETE: 'deletar',
  };
  return methodMap[method.toUpperCase()] || null;
}

/**
 * Obtém a ação de log baseada no método HTTP (para uso com LogActions enum)
 */
export function getLogAction(method: string): LogActions | null {
  const methodMap: Record<string, LogActions> = {
    POST: LogActions.CRIAR,
    PUT: LogActions.EDITAR,
    PATCH: LogActions.EDITAR,
    DELETE: LogActions.DELETAR,
  };
  return methodMap[method.toUpperCase()] || null;
}

/**
 * Mapeia a rota para o módulo correspondente (fallback)
 */
function mapRouteToModule(path: string): Modulos | null {
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
    '/log': Modulos.LOG,
  };

  // Busca correspondência exata primeiro
  for (const [route, modulo] of Object.entries(routeMap)) {
    if (cleanPath === route || cleanPath.startsWith(route + '/')) {
      return modulo;
    }
  }

  return null;
}
