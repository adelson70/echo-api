import { Module } from '@nestjs/common';
import { SaidaController } from './saida.controller';
import { SaidaService } from './saida.service';
import { PrismaModule } from 'src/infra/database/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SaidaController],
    providers: [SaidaService],
})
export class SaidaModule {}