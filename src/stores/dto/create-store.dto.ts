import { IsEmail, IsString, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ description: 'Store name', minLength: 1, maxLength: 60 })
  @IsString()
  @Length(1, 60, { message: 'Store name must be between 1 and 60 characters' })
  name: string;

  @ApiProperty({ description: 'Store email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ description: 'Store address', maxLength: 400, required: false })
  @IsOptional()
  @IsString()
  @Length(0, 400, { message: 'Address must not exceed 400 characters' })
  address?: string;

  @ApiProperty({ description: 'Store owner name', minLength: 8, maxLength: 60 })
  @IsString()
  @Length(8, 60, { message: 'Owner name must be between 8 and 60 characters' })
  ownerName: string;

  @ApiProperty({ description: 'Store owner email address' })
  @IsEmail({}, { message: 'Please provide a valid owner email address' })
  ownerEmail: string;

  @ApiProperty({ description: 'Store owner address', maxLength: 400, required: false })
  @IsOptional()
  @IsString()
  @Length(0, 400, { message: 'Owner address must not exceed 400 characters' })
  ownerAddress?: string;

  @ApiProperty({ description: 'Password for store owner', minLength: 8, maxLength: 16 })
  @IsString()
  @Length(8, 16, { message: 'Password must be between 8 and 16 characters' })
  password: string;
}

