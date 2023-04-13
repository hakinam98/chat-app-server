import { Module } from '@nestjs/common';
import * as express from 'express';
import { ExpressPeerServer } from 'peer';

@Module({})
export class PeerModule {
  constructor() {
    const app = express();
    const server = app.listen(9000);

    const peerServer = ExpressPeerServer(server, {
      path: '/myapp',
    });

    app.use(peerServer);
  }
}
