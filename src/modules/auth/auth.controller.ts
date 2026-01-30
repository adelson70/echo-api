import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/auth.dto";
import type { Request, Response } from "express";
import ms, { StringValue } from "ms";
import { Public } from "src/common/decorators/public-route.decorator";
import { Usuario, type UsuarioPayload } from "src/common/decorators/usuario.decorator";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Public()
    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res() res: Response
    ){
        const { refreshToken, accessToken, usuario } = await this.authService.login(loginDto);
        
        res.cookie('rt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: ms(process.env.JWT_EXPIRE_RT! as StringValue),
            sameSite: 'strict',
        });

        return res.status(200).json({ accessToken, usuario, message: 'Login realizado com sucesso' });
    }

    @Post('logout')
    async logout(
        @Res() res: Response,
    ){
        res.cookie('rt', '', { httpOnly: true, secure: true, maxAge: 0 });
        return res.status(200).json({ message: 'Logout realizado com sucesso' });
    }

    @Get('me')
    async me(
        @Usuario() usuario: UsuarioPayload,
    ){
        return { usuario };
    }

    @Public()
    @Post('refresh-token')
    async refreshToken(
        @Req() req: Request,
        @Res() res: Response
    ){
        try {
            const refreshTokenOld = req.cookies?.rt || req.headers.cookie?.split(';').find(c => c.trim().startsWith('rt='))?.split('=')[1] || '';

            if (!refreshTokenOld) throw new UnauthorizedException('Refresh token não fornecido');

            const { refreshToken, accessToken } = await this.authService.refreshToken(refreshTokenOld);

            res.cookie('rt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: ms(process.env.JWT_EXPIRE_RT! as StringValue),
                sameSite: 'strict',
            });

            return res.status(200).json({ accessToken, message: 'Tokens renovados com sucesso' });
            
        } catch (error) {
            if (error.status === 401) {
                res.cookie('rt', '', { httpOnly: true, secure: true, maxAge: 0 });
            }
            throw error;
        }
    }
}
