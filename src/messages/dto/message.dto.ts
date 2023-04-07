import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
export class MessageDto {
  @ApiProperty()
  @IsNumber()
  conversation_id: number;
  @ApiProperty()
  @IsString()
  message: string;
  @ApiProperty()
  @IsString()
  file: string;
  @ApiProperty()
  @IsNumber()
  user_id: number;
  @ApiProperty({ required: false })
  created_at: Date;
  @ApiProperty({ required: false })
  updated_at: Date;
}
