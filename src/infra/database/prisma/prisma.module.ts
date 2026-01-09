import { Module, Global } from '@nestjs/common';
import { PrismaReadService } from './prisma-read.service';
import { PrismaWriteService } from './prisma-write.service';

@Global()
@Module({
  providers: [PrismaReadService, PrismaWriteService],
  exports: [PrismaReadService, PrismaWriteService],
})
export class PrismaModule {}
