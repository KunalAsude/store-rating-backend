

import { ApiProperty } from '@nestjs/swagger';

export class RatingResponseDto {
    @ApiProperty({ description: 'Rating ID', example: 1 })
    id: number;

    @ApiProperty({ description: 'Rating value', example: 4 })
    rating: number;

    @ApiProperty({ description: 'User ID who gave the rating', example: 1 })
    userId: number;

    @ApiProperty({ description: 'Store ID that was rated', example: 1 })
    storeId: number;

    @ApiProperty({ description: 'Creation date', example: '2023-12-01T00:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date', example: '2023-12-01T00:00:00.000Z' })
    updatedAt: Date;

    @ApiProperty({ description: 'User details', required: false })
    user?: {
        id: number;
        name: string;
        email: string;
    };

    @ApiProperty({ description: 'Store details', required: false })
    store?: {
        id: number;
        name: string;
        email: string;
    };
}
