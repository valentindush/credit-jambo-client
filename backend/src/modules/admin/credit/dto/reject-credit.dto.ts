import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectCreditDto {
  @ApiProperty({ example: 'Credit score too low' })
  @IsString()
  reason: string;
}

