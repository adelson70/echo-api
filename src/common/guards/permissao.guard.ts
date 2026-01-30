import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CanActivate, ExecutionContext } from "@nestjs/common";
import { UsuarioPayload } from "../decorators/usuario.decorator";
import { getModulo, getTipoAcesso } from "../helpers/modulo.helper";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { Modulos } from "@prisma/client";

@Injectable()
export class PermissaoGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly prismaRead: PrismaReadService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        if (this.isPublicRoute(context)) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const { usuario } = request as unknown as { usuario: UsuarioPayload };
        const rt = request.cookies?.rt || request.headers.cookie?.split(';').find(c => c.trim().startsWith('rt='))?.split('=')[1] || '';

        if (!usuario && request.path !== '/auth/login' && !rt) {
            throw new UnauthorizedException('Usuário não autenticado');
        }

        if (request.path === '/auth/login') return true;

        const modulo = this.checkModule(context, request);

        if (usuario.is_admin) return true;

        return await this.checkPermissao(modulo.modulo, modulo.tipoAcesso, usuario);
    }

    private checkModule(context: ExecutionContext, request: Request): Record<string, any> {
        const modulo = getModulo(context, this.reflector, request);
        const tipoAcesso = getTipoAcesso(request.method);

        if (!modulo) {
            throw new UnauthorizedException('Módulo não encontrado');
        }

        if (!tipoAcesso) {
            throw new UnauthorizedException('Tipo de acesso não encontrado');
        }

        return { modulo, tipoAcesso };
    }

    private async checkPermissao(modulo: Modulos, tipoAcesso: string, usuario: UsuarioPayload): Promise<boolean> {
        const permissao = await this.prismaRead.usuario.findUnique({
            where: { id: usuario.id },
            select: {
                permissoesUsuario: {
                    select: {
                        modulo: true,
                        criar: true,
                        ler: true,
                        editar: true,
                        deletar: true,
                    }
                },
                perfil: {
                    select: {
                        permissoes: {
                            select: {
                                modulo: true,
                                criar: true,
                                ler: true,
                                editar: true,
                                deletar: true,
                            }
                        }
                    }
                },
            }
        });

        const permissaoModuloUsuario = permissao?.permissoesUsuario.find(
            p => p.modulo === modulo
        );

        if (permissaoModuloUsuario) {
            const acessar = permissaoModuloUsuario[tipoAcesso as keyof typeof permissaoModuloUsuario] === true;
            if (!acessar) throw new UnauthorizedException(`Permissão individual do usuário não permite ${tipoAcesso} no modulo ${modulo}`);
            return true;
        }

        const permissaoModuloPerfil = permissao?.perfil?.permissoes.find(
            p => p.modulo === modulo
        );

        if (permissaoModuloPerfil) {
            const acessar = permissaoModuloPerfil[tipoAcesso as keyof typeof permissaoModuloPerfil] === true;
            if (!acessar) throw new UnauthorizedException(`Perfil do usuário não permite ${tipoAcesso} no modulo ${modulo}`);
            return true;
        }

        throw new UnauthorizedException(`Usuário não permite ${tipoAcesso} no modulo ${modulo}`);
    }

    private isPublicRoute(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        return isPublic;
    }
}