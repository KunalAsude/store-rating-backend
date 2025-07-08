import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Abc Xyz', required: false })
  @IsString()
  @MinLength(20)
  @MaxLength(60)
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '123 Main Street, City, State, Country', required: false })
  @IsString()
  @MaxLength(400)
  @IsOptional()
  address?: string;
}