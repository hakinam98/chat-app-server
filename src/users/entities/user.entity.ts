import { ApiProperty } from '@nestjs/swagger';
import { users } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements users {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @Exclude()
  password: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
