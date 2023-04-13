import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { PeerModule } from './peer/peer.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, MessagesModule, PeerModule],
})
export class AppModule {}
