import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CallToDto {
  @ApiProperty()
  @IsNumber()
  from: number;

  @ApiProperty()
  @IsNumber()
  to: number;
}
