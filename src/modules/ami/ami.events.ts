import { Injectable, OnModuleInit } from '@nestjs/common';
import { AmiClient } from './ami.client';
import { AmiService } from './ami.service';

@Injectable()
export class AmiEvents implements OnModuleInit {
  constructor(
    private readonly amiClient: AmiClient,
    private readonly amiService: AmiService,
  ) {}

  onModuleInit() {
    this.amiClient.on('Newchannel', e =>
      this.amiService.onNewChannel(e),
    );

    this.amiClient.on('Hangup', e =>
      this.amiService.onHangup(e),
    );

    this.amiClient.on('PeerStatus', e =>
      this.amiService.onPeerStatus(e),
    );
  }
}
