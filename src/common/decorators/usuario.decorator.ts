import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface UsuarioPayload {
    id: string;
    email: string;
    nome: string;
    is_admin: boolean;
    perfil_id: string | null;
} 

export const Usuario = createParamDecorator(
    (data: keyof UsuarioPayload | undefined, ctx: ExecutionContext): UsuarioPayload[keyof UsuarioPayload] | UsuarioPayload => {
    const request = ctx.switchToHttp().getRequest();
    const usuario = request.usuario as UsuarioPayload;
    return data ? usuario?.[data] : usuario;
},
)