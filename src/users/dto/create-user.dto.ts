import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'Abc Xyz' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(60)
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'Password must contain at least one uppercase letter and one special character'
  })
  password: string;

  @ApiProperty({ example: '123 Main Street, City, State, Country' })
  @IsString()
  @MaxLength(400)
  @IsOptional()
  address?: string;

  @ApiProperty({ enum: Role, example: Role.NORMAL_USER })
  @IsEnum(Role)
  role: Role;
}