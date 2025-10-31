import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class RepayCreditDto {
  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;
}

