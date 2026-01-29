import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { LogService } from 'src/modules/log/log.service';
import { LogActions, LogStatus, Modulos } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsuarioPayload } from '../decorators/usuario.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
	private readonly logger = new Logger('AuthGuard');
	constructor(
		private jwtService: JwtService,
		private logService: LogService,
		private reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (this.isPublicRoute(context)) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();
		const { method, originalUrl } = request;
		const ip = request.ip || request.socket.remoteAddress || 'desconhecido';

		// Verifica se deve ignorar rota (mesmas rotas do interceptor: docs, health, log)
		if (this.shouldIgnoreRoute(originalUrl)) {
			return true;
		}

		const { at, rt } = this.getTokens(request);

		if (!rt) {
			await this.logUnauthenticatedAttempt(method, originalUrl, ip, 'refresh_token_ausente', request);
			this.clearRefreshTokenFromCookie(response);
			throw new UnauthorizedException('Refresh token não fornecido');
		}

		if (!at) {
			await this.logUnauthenticatedAttempt(method, originalUrl, ip, 'access_token_ausente', request);
			throw new UnauthorizedException('Access token não fornecido');
		}

		try {
			// Valida access token
			const payload = await this.validadeToken(at, process.env.JWT_SECRET_AT!) as {
				id: string;
				email: string;
				nome: string;
				is_admin: boolean;
				perfil_id: string;
			};
			
			// popula o request.usuario
			(request as any).usuario = {
				id: payload.id,
				email: payload.email,
				nome: payload.nome,
				is_admin: payload.is_admin,
				perfil_id: payload.perfil_id,
			} as UsuarioPayload;
			
			return true;
		} catch (error) {
			// Token inválido/expirado - registra log e barra
			console.log(error);
			const reason = error.name === 'TokenExpiredError' ? 'access_token_expirado' : 'access_token_invalido';
			await this.logUnauthenticatedAttempt(method, originalUrl, ip, reason, request);
			throw new UnauthorizedException('Token inválido ou expirado');
		}
	}

	private async logUnauthenticatedAttempt(
		method: string,
		path: string,
		ip: string,
		reason: 'access_token_ausente' | 'refresh_token_ausente' | 'access_token_invalido' | 'refresh_token_invalido' | 'access_token_expirado' | 'refresh_token_expirado',
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
				usuario_id: null,
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
		const ignoredRoutes = ['/docs', '/docs-json', '/health'];
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
			'/regra': Modulos.REGRA,
		};

		// Busca correspondência exata primeiro
		for (const [route, modulo] of Object.entries(routeMap)) {
			if (cleanPath === route || cleanPath.startsWith(route + '/')) {
				return modulo;
			}
		}

		return null;
	}

	private getRefreshTokenFromCookie(request: Request): string {
		return request.headers.cookie?.split(';').find(c => c.trim().startsWith('rt='))?.split('=')[1] || '';
	}

	private getAccessTokenFromHeader(request: Request): string {
		const at = request.headers.authorization;
		return at ? at.substring(7) : '';
	}

	private getTokens(request: Request): { at: string, rt: string } {
		return {
			at: this.getAccessTokenFromHeader(request),
			rt: this.getRefreshTokenFromCookie(request),
		};
	}

	private async validadeToken(token: string, secret: string): Promise<any> {
		try {
			return await this.jwtService.verifyAsync(token, { secret });
		} catch (error) {
			throw new UnauthorizedException('Token inválido ou expirado');
		}
	}

	private clearRefreshTokenFromCookie(res: Response): void {
		res.cookie('rt', '', { httpOnly: true, secure: true, maxAge: 0 });
	}

	private isPublicRoute(context: ExecutionContext): boolean {
		const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
			context.getHandler(),
			context.getClass(),
		]);
		return isPublic;
	}
}
