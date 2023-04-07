import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class ConnectedDto {
  @ApiProperty()
  @IsNumber()
  user_id: number;
  @ApiProperty()
  @IsNumber()
  socket?: string;
  @ApiProperty()
  @IsNumber()
  peer?: string;
}
