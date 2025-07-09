import { IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
    @ApiProperty({ description: 'Store ID to rate', example: 1 })
    @IsInt()
    @IsNotEmpty()
    storeId: number;

    @ApiProperty({ description: 'Rating value (1-5)', minimum: 1, maximum: 5, example: 4 })
    @IsInt()
    @Min(1, { message: 'Rating must be at least 1' })
    @Max(5, { message: 'Rating must be at most 5' })
    rating: number;
}