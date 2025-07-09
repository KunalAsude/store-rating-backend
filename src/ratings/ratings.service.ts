// src/ratings/ratings.service.ts
import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';
import { StoreRatingStatsDto } from './dto/store-rating-stats.dto';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create or update a rating (Normal User only)
  async createRating(userId: number, createRatingDto: CreateRatingDto): Promise<RatingResponseDto> {
    const { storeId, rating } = createRatingDto;

    // Check if store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    // Check if user has already rated this store
    const existingRating = await this.prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (existingRating) {
      throw new ConflictException('You have already rated this store. Use update rating instead.');
    }

    // Create new rating
    const newRating = await this.prisma.rating.create({
      data: {
        userId,
        storeId,
        rating,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return newRating;
  }

  // Update existing rating (Normal User only)
  async updateRating(userId: number, ratingId: number, updateRatingDto: UpdateRatingDto): Promise<RatingResponseDto> {
    const { rating } = updateRatingDto;

    // Check if rating exists and belongs to the user
    const existingRating = await this.prisma.rating.findUnique({
      where: { id: ratingId },
    });

    if (!existingRating) {
      throw new NotFoundException(`Rating with ID ${ratingId} not found`);
    }

    if (existingRating.userId !== userId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    // Update the rating
    const updatedRating = await this.prisma.rating.update({
      where: { id: ratingId },
      data: { rating },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedRating;
  }

  // Delete rating (Normal User only)
  async deleteRating(userId: number, ratingId: number): Promise<void> {
    const existingRating = await this.prisma.rating.findUnique({
      where: { id: ratingId },
    });

    if (!existingRating) {
      throw new NotFoundException(`Rating with ID ${ratingId} not found`);
    }

    if (existingRating.userId !== userId) {
      throw new ForbiddenException('You can only delete your own ratings');
    }

    await this.prisma.rating.delete({
      where: { id: ratingId },
    });
  }

  // Get all ratings for a store (Admin and Store Owner)
  async getStoreRatings(storeId: number, userId?: number, userRole?: Role): Promise<RatingResponseDto[]> {
    // Check if store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    // If user is store owner, check if they own this store
    if (userRole === Role.STORE_OWNER) {
      if (store.ownerId !== userId) {
        throw new ForbiddenException('You can only view ratings for your own store');
      }
    }

    const ratings = await this.prisma.rating.findMany({
      where: { storeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return ratings;
  }

  // Get all ratings by a user (Admin and the user themselves)
  async getUserRatings(targetUserId: number, requestingUserId?: number, userRole?: Role): Promise<RatingResponseDto[]> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${targetUserId} not found`);
    }

    // If not admin, user can only view their own ratings
    if (userRole !== Role.ADMIN && requestingUserId !== targetUserId) {
      throw new ForbiddenException('You can only view your own ratings');
    }

    const ratings = await this.prisma.rating.findMany({
      where: { userId: targetUserId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return ratings;
  }

  // Get store rating statistics (for store dashboard)
  async getStoreRatingStats(storeId: number, userId?: number, userRole?: Role): Promise<StoreRatingStatsDto> {
    // Check if store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    // If user is store owner, check if they own this store
    if (userRole === Role.STORE_OWNER) {
      if (store.ownerId !== userId) {
        throw new ForbiddenException('You can only view statistics for your own store');
      }
    }

    // Get all ratings for the store
    const ratings = await this.prisma.rating.findMany({
      where: { storeId },
      select: {
        rating: true,
      },
    });

    if (ratings.length === 0) {
      return {
        storeId,
        storeName: store.name,
        averageRating: 0,
        totalRatings: 0,
        ratingBreakdown: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    // Calculate average rating
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Math.round((totalRating / ratings.length) * 10) / 10;

    // Calculate rating breakdown
    const ratingBreakdown = {
      1: ratings.filter(r => r.rating === 1).length,
      2: ratings.filter(r => r.rating === 2).length,
      3: ratings.filter(r => r.rating === 3).length,
      4: ratings.filter(r => r.rating === 4).length,
      5: ratings.filter(r => r.rating === 5).length,
    };

    return {
      storeId,
      storeName: store.name,
      averageRating,
      totalRatings: ratings.length,
      ratingBreakdown,
    };
  }

  // Get user's rating for a specific store
  async getUserRatingForStore(userId: number, storeId: number): Promise<RatingResponseDto | null> {
    const rating = await this.prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return rating;
  }

  // Get all ratings (Admin only)
  async getAllRatings(): Promise<RatingResponseDto[]> {
    const ratings = await this.prisma.rating.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return ratings;
  }

  // Get rating statistics for admin dashboard
  async getRatingStatistics() {
    const totalRatings = await this.prisma.rating.count();
    
    const averageRating = await this.prisma.rating.aggregate({
      _avg: {
        rating: true,
      },
    });

    const ratingDistribution = await this.prisma.rating.groupBy({
      by: ['rating'],
      _count: {
        rating: true,
      },
    });

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratingDistribution.forEach(item => {
      distribution[item.rating] = item._count.rating;
    });

    return {
      totalRatings,
      averageRating: Math.round((averageRating._avg.rating || 0) * 10) / 10,
      distribution,
    };
  }
}