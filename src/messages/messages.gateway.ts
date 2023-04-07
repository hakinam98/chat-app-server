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
  // @SubscribeMessage('send_message')
  // async createReply(@MessageBody() messageDto: MessageDto) {
  //   const conversation = await this.prisma.conversations.findUnique({
  //     where: {
  //       id: messageDto.conversation_id,
  //     },
  //   });
  // }
}
