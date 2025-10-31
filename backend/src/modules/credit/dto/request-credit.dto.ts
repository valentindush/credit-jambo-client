import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsInt, Min, Max, IsString, IsOptional } from 'class-validator';

export class RequestCreditDto {
  @ApiProperty({ example: 10000.00, description: 'Credit amount requested' })
  @IsNumber()
  @IsPositive()
  @Min(100)
  @Max(1000000)
  amount: number;

  @ApiProperty({ example: 12, description: 'Tenure in months' })
  @IsInt()
  @Min(1)
  @Max(60)
  tenure: number;

  @ApiProperty({ example: 'Business expansion', required: false })
  @IsOptional()
  @IsString()
  purpose?: string;
}

