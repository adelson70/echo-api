import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './infra/database/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuthGuard } from './common/guards/unified-auth.guard';
import { RamalModule } from './modules/ramal/ramal.module';
import { RegraModule } from './modules/regra/regra.module';
import { TroncoModule } from './modules/tronco/tronco.module';
import { FilaModule } from './modules/fila/fila.module';
import { UsuarioModule } from './modules/usuario/usuario.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    RegraModule,
    RamalModule,
    TroncoModule,
    FilaModule,
    UsuarioModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
