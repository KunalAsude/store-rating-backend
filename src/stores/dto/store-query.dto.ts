import { IsOptional, IsString, IsIn, IsInt, Min, Max, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StoreQueryDto {
  @ApiProperty({ description: 'Filter by store name', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 60, { message: 'Name filter must be between 1 and 60 characters' })
  name?: string;

  @ApiProperty({ description: 'Filter by store email', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Filter by store address', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 400, { message: 'Address filter must be between 1 and 400 characters' })
  address?: string;

  @ApiProperty({ description: 'Filter by owner ID', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  ownerId?: number;

  @ApiProperty({ description: 'Search query for name and address', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Search query must be between 1 and 100 characters' })
  search?: string;

  @ApiProperty({ description: 'Sort by field', enum: ['name', 'email', 'address', 'createdAt'], required: false })
  @IsOptional()
  @IsIn(['name', 'email', 'address', 'createdAt'])
  sortBy?: string = 'name';

  @ApiProperty({ description: 'Sort order', enum: ['asc', 'desc'], required: false })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';

  @ApiProperty({ description: 'Page number', minimum: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', minimum: 1, maximum: 100, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}