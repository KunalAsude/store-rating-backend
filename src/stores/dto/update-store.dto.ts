import { IsEmail, IsString, Length, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStoreDto {
  @ApiProperty({ description: 'Store name', minLength: 1, maxLength: 60, required: false })
  @IsOptional()
  @IsString()
  @Length(1, 60, { message: 'Store name must be between 1 and 60 characters' })
  name?: string;

  @ApiProperty({ description: 'Store email address', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({ description: 'Store address', maxLength: 400, required: false })
  @IsOptional()
  @IsString()
  @Length(0, 400, { message: 'Address must not exceed 400 characters' })
  address?: string;

  @ApiProperty({ description: 'Owner user ID (must be existing user)', required: false })
  @IsOptional()
  @IsInt({ message: 'Owner ID must be a valid integer' })
  @Min(1, { message: 'Owner ID must be greater than 0' })
  ownerId?: number;
}