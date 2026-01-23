import { Module } from '@nestjs/common';
import { RegraController } from './regra.controller';
import { RegraService } from './regra.service';
import { PrismaModule } from 'src/infra/database/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [RegraController],
  providers: [RegraService],
})
export class RegraModule {}
