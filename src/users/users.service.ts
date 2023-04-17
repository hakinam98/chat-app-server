import { Injectable, NotAcceptableException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: createUserDto.email },
    });
    console.log(user);

    if (user) {
      throw new NotAcceptableException('email existed!');
    }
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    createUserDto.password = hashedPassword;

    return this.prisma.users.create({ data: createUserDto });
  }

  async findAll(id) {
    const users = await this.prisma.users.findMany();
    return users.filter((user) => user.id !== id);
  }

  findOne(id: number) {
    return this.prisma.users.findUnique({ where: { id } });
  }

  async findPeerId(id: number) {
    const userConnected = await this.prisma.connected.findUnique({
      where: { user_id: id },
    });
    console.log(userConnected);

    if (userConnected) {
      return userConnected.peer;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }
    return this.prisma.users.update({ where: { id }, data: updateUserDto });
  }

  remove(id: number) {
    return this.prisma.users.delete({ where: { id } });
  }
}
