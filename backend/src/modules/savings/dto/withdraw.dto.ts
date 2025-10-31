import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional, Min } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @ApiProperty({ required: false, example: 'Emergency withdrawal' })
  @IsOptional()
  @IsString()
  description?: string;
}

