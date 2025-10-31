import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveCreditDto {
  @ApiProperty({ example: 'Credit approved' })
  @IsString()
  @IsOptional()
  notes?: string;
}

