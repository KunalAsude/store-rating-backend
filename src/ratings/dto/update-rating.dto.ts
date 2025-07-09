
import { PartialType } from '@nestjs/swagger';
import { CreateRatingDto } from './create-rating.dto';
import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRatingDto {
    @ApiProperty({ description: 'Rating value (1-5)', minimum: 1, maximum: 5, example: 4 })
    @IsInt()
    @Min(1, { message: 'Rating must be at least 1' })
    @Max(5, { message: 'Rating must be at most 5' })
    rating: number;
}
