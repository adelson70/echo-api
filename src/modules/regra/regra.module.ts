import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { EntradaModule } from './entrada/entrada.module';
import { SaidaModule } from './saida/saida.module';
import { RegraController } from './regra.controller';
import { RegraService } from './regra.service';

@Module({
  imports: [
    EntradaModule,
    SaidaModule,
    RouterModule.register([
      {
        path: 'regra',
        children: [
          { path: 'entrada', module: EntradaModule },
          { path: 'saida', module: SaidaModule },
        ],
      },
    ]),
  ],
  controllers: [RegraController],
  providers: [RegraService],
})
export class RegraModule {}
