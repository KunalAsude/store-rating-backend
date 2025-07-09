import { ApiProperty } from '@nestjs/swagger';

export class StoreResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  address: string | null;

  @ApiProperty()
  ownerId: number;

  @ApiProperty({ required: false })
  owner?: {
    id: number;
    name: string;
    email: string;
  };

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  totalRatings: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  userRating?: number;
}

export class StoreListResponseDto {
  @ApiProperty({ type: [StoreResponseDto] })
  stores: StoreResponseDto[];

  @ApiProperty()
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class StoreDashboardResponseDto {
  @ApiProperty()
  store: {
    id: number;
    name: string;
    email: string;
    address: string | null;
    ownerId: number;
    averageRating: number;
    totalRatings: number;
  };

  @ApiProperty()
  ratings: Array<{
    id: number;
    rating: number;
    createdAt: Date;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
}