import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/auth.dto";
import type { Response } from "express";
import ms, { StringValue } from "ms";
import { Public } from "src/common/decorators/public-route.decorator";

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

        return res.status(200).json({ accessToken, usuario });
    }
}
