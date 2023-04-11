import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { PeerjsController } from './peer/peer.controller';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, MessagesModule],
  controllers: [AppController, PeerjsController],
  providers: [AppService],
})
export class AppModule {}
