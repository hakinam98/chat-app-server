import { Controller, Get } from '@nestjs/common';
import { PeerServer } from 'peerjs-server';

@Controller()
export class PeerjsController {
  @Get()
  async getPeerjsServer(): Promise<string> {
    const peerServer = PeerServer({ port: 9000, path: '/peer' });
    return `PeerJS server running on port ${peerServer.options.port}`;
  }
}
