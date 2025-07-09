import { ApiProperty } from "@nestjs/swagger";

export class StoreRatingStatsDto {
    @ApiProperty({ description: 'Store ID', example: 1 })
    storeId: number;

    @ApiProperty({ description: 'Store name', example: 'Pizza Palace' })
    storeName: string;

    @ApiProperty({ description: 'Average rating', example: 4.2 })
    averageRating: number;

    @ApiProperty({ description: 'Total number of ratings', example: 15 })
    totalRatings: number;

    @ApiProperty({ description: 'Rating breakdown by stars' })
    ratingBreakdown: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}