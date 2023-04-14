import { Module } from '@nestjs/common';
import * as express from 'express';
import { ExpressPeerServer } from 'peer';

@Module({})
export class PeerModule {
  constructor() {
    const app = express();
    const server = app.listen(process.env.PORT || 9000);

    const peerServer = ExpressPeerServer(server, {
      path: '/peer',
    });
    app.use(peerServer);
  }
}
