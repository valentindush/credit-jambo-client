import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional, Min } from 'class-validator';

export class DepositDto {
  @ApiProperty({ example: 1000.00 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @ApiProperty({ required: false, example: 'Monthly salary deposit' })
  @IsOptional()
  @IsString()
  description?: string;
}

