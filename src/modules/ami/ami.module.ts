import { Module } from '@nestjs/common';
import { AmiClient } from './ami.client';
import { AmiService } from './ami.service';
import { AmiEvents } from './ami.events';

@Module({
  providers: [AmiClient, AmiService, AmiEvents],
  exports: [AmiClient, AmiService],
})
export class AmiModule {}
