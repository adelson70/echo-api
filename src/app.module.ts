import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './infra/database/prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { AuthGuard } from './common/guards/auth.guard';
import { RamalModule } from './modules/ramal/ramal.module';
import { RegraModule } from './modules/regra/regra.module';
import { TroncoModule } from './modules/tronco/tronco.module';
import { FilaModule } from './modules/fila/fila.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { GrupoDeCapturaModule } from './modules/grupo-de-captura/grupo-de-captura.module';
import { RelatorioModule } from './modules/relatorio/relatorio.module';
import { SistemaModule } from './modules/sistema/sistema.module';
import { LogModule } from './modules/log/log.module';
import { AuthModule } from './modules/auth/auth.module';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    JwtModule.register({
      global: true,
    }),
    RegraModule,
    RamalModule,
    TroncoModule,
    FilaModule,
    UsuarioModule,
    GrupoDeCapturaModule,
    RelatorioModule,
    SistemaModule,
    LogModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    Reflector,
  ],
})
export class AppModule {}
