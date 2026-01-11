import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { LogService } from 'src/modules/log/log.service';
import { LogActions, LogStatus, Modulos } from '@prisma/client';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
	private readonly logger = new Logger('AuthGuard');
	constructor(
		private jwtService: JwtService,
		private logService: LogService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const { method, originalUrl } = request;
		const ip = request.ip || request.socket.remoteAddress || 'desconhecido';

		// Verifica se deve ignorar rota (mesmas rotas do interceptor: docs, health, log)
		if (this.shouldIgnoreRoute(originalUrl)) {
			return true;
		}

		// Extrai token do header Authorization
		const authHeader = request.headers.authorization;
		
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			// Token não existe - registra log e barra
			await this.logUnauthenticatedAttempt(method, originalUrl, ip, 'token_ausente', request);
			throw new UnauthorizedException('Token não fornecido');
		}

		const token = authHeader.substring(7);

		try {
			// Valida token
			const payload = await this.jwtService.verifyAsync(token);
			
			// Token válido - popula request.user e permite continuar
			(request as any).user = {
				id: payload.sub || payload.id,
				email: payload.email,
				nome: payload.nome,
			};
			
			return true;
		} catch (error) {
			// Token inválido/expirado - registra log e barra
			const reason = error.name === 'TokenExpiredError' ? 'token_expirado' : 'token_invalido';
			await this.logUnauthenticatedAttempt(method, originalUrl, ip, reason, request);
			throw new UnauthorizedException('Token inválido ou expirado');
		}
	}

	private async logUnauthenticatedAttempt(
		method: string,
		path: string,
		ip: string,
		reason: 'token_ausente' | 'token_invalido' | 'token_expirado',
		request: Request,
	): Promise<void> {
		try {
			// Mapeia método HTTP para ação
			const acao = this.mapMethodToAction(method);
			
			// Se não for uma ação que precisa de log, não registra
			if (!acao) {
				return;
			}

			// Mapeia rota para módulo
			const modulo = this.mapRouteToModule(path);

			// Cria log com status TENTATIVA usando usuarioId: null
			this.logger.log(`[${method}] ${path} - IP: ${ip} - Ação: ${acao} - Módulo: ${modulo} - Status: ${LogStatus.TENTATIVA} - Motivo: ${reason}`);
			await this.logService.create({
				usuarioId: null,
				ip,
				status: LogStatus.TENTATIVA,
				acao,
				modulo,
				metaData: {
					autenticado: false,
					metodo: method,
					rota: path,
					dados_enviados: request?.body || "vazio",
					query: request?.query || "vazio",
					parametros: request?.params || "vazio",
					motivo: reason,
				},
			});
		} catch (error) {
			// Falha silenciosa - não queremos que o log quebre a requisição
			console.error('Erro ao registrar tentativa não autenticada:', error);
		}
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

