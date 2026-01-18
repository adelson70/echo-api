import { Injectable } from '@nestjs/common';

@Injectable()
export class AmiService {
  onNewChannel(event: any) {
    console.log('Novo canal:', event.Channel);
  }

  onHangup(event: any) {
    console.log('Ligação encerrada:', event.Uniqueid);
  }

  onPeerStatus(event: any) {
    console.log('Peer:', event.Peer, event.PeerStatus);
  }
}
