import { HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { LoginDto } from "./dto/auth.dto";
import { PasswordService } from "src/common/services/password.service";
import { JwtService } from "@nestjs/jwt";
import { Usuario } from "@prisma/client";
import type { StringValue } from "ms";
import { UsuarioPayload } from "src/common/decorators/usuario.decorator";

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaRead: PrismaReadService, 
        private readonly prismaWrite: PrismaWriteService,
        private readonly passwordService: PasswordService,
        private readonly jwtService: JwtService,
    ) 
    {}

    async login(loginDto: LoginDto){
        try {
            const { email, password } = loginDto;
    
            const usuario = await this.prismaRead.usuario.findUnique({
                where: {
                    email,
                }
            })
    
            if (!usuario) throw new UnauthorizedException('Credenciais inválidas');
    
            const isPasswordValid = this.passwordService.validateHash(password, usuario.senha);
    
            if (!isPasswordValid) throw new UnauthorizedException('Credenciais inválidas');
    
            const { accessToken, refreshToken } = await this.generateTokens(usuario);
    
            await this.prismaWrite.usuario.update({
                where: { id: usuario.id },
                data: { last_login: new Date() },
            });

            return { refreshToken, accessToken, usuario };

        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro ao fazer login');
        }
    }

    async refreshToken(refreshTokenOld: string){
        try {
            const payload = await this.jwtService.verifyAsync(refreshTokenOld, {
                secret: process.env.JWT_SECRET_RT,
            }) as UsuarioPayload;

            const { accessToken, refreshToken } = await this.generateTokens(payload);

            return { accessToken, refreshToken };
        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro ao atualizar token');
        }
    }

    private async generateTokens(usuario: UsuarioPayload){
        const payload = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            is_admin: usuario.is_admin,
            perfil_id: usuario.perfil_id
        } as UsuarioPayload;

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET_AT,
            expiresIn: process.env.JWT_EXPIRE_AT! as StringValue,
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET_RT,
            expiresIn: process.env.JWT_EXPIRE_RT! as StringValue,
        });

        return { accessToken, refreshToken };
    }
}
