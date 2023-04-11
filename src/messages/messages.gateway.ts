import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConnectedDto } from './dto/connected.dto';
import { MessageDto } from './dto/message.dto';
import { PeerDto } from './dto/peer.dto';
import { CallToDto } from './dto/callto.dto';

@WebSocketGateway({
  origin: '*:*',
  transports: ['websocket'],
})
export class MessagesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly messagesService: MessagesService,
    private prisma: PrismaService,
  ) {}

  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('MessagesGateway');

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(client.id, 'Connected.....................');
    const userId = +client.handshake?.query?.user_id;
    if (userId) {
      const connectedUser: ConnectedDto = {
        user_id: userId,
        socket: client.id,
      };
      const isConnected = await this.prisma.connected.findFirst({
        where: {
          user_id: connectedUser.user_id,
        },
      });
      if (!isConnected) {
        await this.prisma.connected.create({
          data: connectedUser,
        });
        await this.prisma.users.update({
          where: {
            id: connectedUser.user_id,
          },
          data: {
            status: 'online',
            offline_at: new Date(),
          },
        });
      } else {
        await this.prisma.connected.update({
          where: {
            id: isConnected.id,
          },
          data: {
            socket: client.id,
          },
        });
        await this.prisma.users.update({
          where: {
            id: connectedUser.user_id,
          },
          data: {
            status: 'online',
            offline_at: new Date(),
          },
        });
      }
    }
  }

  afterInit(server: Server) {
    this.server.on('connect_error', (err) => console.log(err));
    this.server.on('connect-failed', (err) => console.log(err));
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(client.id, 'Disconnected......................');
    const isConnected = await this.prisma.connected.findFirst({
      where: {
        socket: client.id,
      },
    });
    if (isConnected) {
      const connectedInfor = await this.prisma.connected.delete({
        where: {
          id: isConnected.id,
        },
      });
      await this.prisma.users.update({
        where: {
          id: connectedInfor.user_id,
        },
        data: {
          status: 'offline',
          offline_at: new Date(),
        },
      });
    }
  }

  @SubscribeMessage('peer-id')
  async createPeerId(@MessageBody() peerDto: PeerDto) {
    await this.prisma.connected.update({
      where: {
        user_id: peerDto.user_id,
      },
      data: {
        peer: peerDto.peer_id,
      },
    });
  }

  @SubscribeMessage('call-to')
  async getSocketId(@MessageBody() callToDto: CallToDto) {
    const userConnected = await this.prisma.connected.findUnique({
      where: {
        user_id: callToDto.to,
      },
    });
    if (userConnected) {
      await this.server.to(userConnected.socket).emit('calling', {
        message: `You have a call from user id ${callToDto.from}`,
      });
    }
  }

  @SubscribeMessage('get-peer-id')
  async getPeerId(@MessageBody() id: number) {
    const userConnected = await this.prisma.connected.findUnique({
      where: {
        user_id: id,
      },
    });
    if (userConnected) {
      this.server.emit('rec-peer-id', userConnected.peer);
    }
  }
}
