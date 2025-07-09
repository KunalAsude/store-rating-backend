// src/ratings/ratings.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    HttpStatus,
    ParseIntPipe,
    Query,
  } from '@nestjs/common';
  import { RatingsService } from './ratings.service';

  import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

  import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RatingResponseDto } from './dto/rating-response.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { StoreRatingStatsDto } from './dto/store-rating-stats.dto';
  
  @ApiTags('ratings')
  @Controller('ratings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  export class RatingsController {
    constructor(private readonly ratingsService: RatingsService) {}
  
    // Create new rating (Normal User only)
    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.NORMAL_USER)
    @ApiOperation({ summary: 'Create a new rating for a store' })
    @ApiResponse({ status: 201, description: 'Rating created successfully', type: RatingResponseDto })
    @ApiResponse({ status: 409, description: 'User has already rated this store' })
    @ApiResponse({ status: 404, description: 'Store not found' })
    async createRating(
      @Request() req,
      @Body() createRatingDto: CreateRatingDto,
    ): Promise<RatingResponseDto> {
      return this.ratingsService.createRating(req.user.id, createRatingDto);
    }
  
    // Update existing rating (Normal User only)
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.NORMAL_USER)
    @ApiOperation({ summary: 'Update an existing rating' })
    @ApiResponse({ status: 200, description: 'Rating updated successfully', type: RatingResponseDto })
    @ApiResponse({ status: 403, description: 'You can only update your own ratings' })
    @ApiResponse({ status: 404, description: 'Rating not found' })
    async updateRating(
      @Request() req,
      @Param('id', ParseIntPipe) id: number,
      @Body() updateRatingDto: UpdateRatingDto,
    ): Promise<RatingResponseDto> {
      return this.ratingsService.updateRating(req.user.id, id, updateRatingDto);
    }
  
    // Delete rating (Normal User only)
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.NORMAL_USER)
    @ApiOperation({ summary: 'Delete a rating' })
    @ApiResponse({ status: 200, description: 'Rating deleted successfully' })
    @ApiResponse({ status: 403, description: 'You can only delete your own ratings' })
    @ApiResponse({ status: 404, description: 'Rating not found' })
    async deleteRating(
      @Request() req,
      @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
      await this.ratingsService.deleteRating(req.user.id, id);
      return { message: 'Rating deleted successfully' };
    }
  
    // Get all ratings (Admin only)
    @Get()
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get all ratings (Admin only)' })
    @ApiResponse({ status: 200, description: 'List of all ratings', type: [RatingResponseDto] })
    async getAllRatings(): Promise<RatingResponseDto[]> {
      return this.ratingsService.getAllRatings();
    }
  
    // Get rating statistics (Admin only)
    @Get('stats')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get rating statistics (Admin only)' })
    @ApiResponse({ status: 200, description: 'Rating statistics' })
    async getRatingStatistics() {
      return this.ratingsService.getRatingStatistics();
    }
  
    // Get ratings for a specific store (Admin and Store Owner)
    @Get('store/:storeId')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.STORE_OWNER)
    @ApiOperation({ summary: 'Get all ratings for a specific store' })
    @ApiResponse({ status: 200, description: 'List of ratings for the store', type: [RatingResponseDto] })
    @ApiResponse({ status: 403, description: 'You can only view ratings for your own store' })
    @ApiResponse({ status: 404, description: 'Store not found' })
    async getStoreRatings(
      @Request() req,
      @Param('storeId', ParseIntPipe) storeId: number,
    ): Promise<RatingResponseDto[]> {
      return this.ratingsService.getStoreRatings(storeId, req.user.id, req.user.role);
    }
  
    // Get rating statistics for a specific store (Admin and Store Owner)
    @Get('store/:storeId/stats')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.STORE_OWNER)
    @ApiOperation({ summary: 'Get rating statistics for a specific store' })
    @ApiResponse({ status: 200, description: 'Rating statistics for the store', type: StoreRatingStatsDto })
    @ApiResponse({ status: 403, description: 'You can only view statistics for your own store' })
    @ApiResponse({ status: 404, description: 'Store not found' })
    async getStoreRatingStats(
      @Request() req,
      @Param('storeId', ParseIntPipe) storeId: number,
    ): Promise<StoreRatingStatsDto> {
      return this.ratingsService.getStoreRatingStats(storeId, req.user.id, req.user.role);
    }
  
    // Get ratings by a specific user (Admin and the user themselves)
    @Get('user/:userId')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.NORMAL_USER)
    @ApiOperation({ summary: 'Get all ratings by a specific user' })
    @ApiResponse({ status: 200, description: 'List of ratings by the user', type: [RatingResponseDto] })
    @ApiResponse({ status: 403, description: 'You can only view your own ratings' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserRatings(
      @Request() req,
      @Param('userId', ParseIntPipe) userId: number,
    ): Promise<RatingResponseDto[]> {
      return this.ratingsService.getUserRatings(userId, req.user.id, req.user.role);
    }
  
    // Get user's rating for a specific store (Any authenticated user)
    @Get('user/:userId/store/:storeId')
    @ApiOperation({ summary: 'Get user rating for a specific store' })
    @ApiResponse({ status: 200, description: 'User rating for the store', type: RatingResponseDto })
    @ApiResponse({ status: 404, description: 'Rating not found' })
    async getUserRatingForStore(
      @Param('userId', ParseIntPipe) userId: number,
      @Param('storeId', ParseIntPipe) storeId: number,
    ): Promise<RatingResponseDto | null> {
      return this.ratingsService.getUserRatingForStore(userId, storeId);
    }
  
    // Get my ratings (Current user's ratings)
    @Get('my-ratings')
    @UseGuards(RolesGuard)
    @Roles(Role.NORMAL_USER)
    @ApiOperation({ summary: 'Get current user ratings' })
    @ApiResponse({ status: 200, description: 'Current user ratings', type: [RatingResponseDto] })
    async getMyRatings(@Request() req): Promise<RatingResponseDto[]> {
      return this.ratingsService.getUserRatings(req.user.id, req.user.id, req.user.role);
    }
  
    // Get my rating for a specific store (Current user's rating)
    @Get('my-rating/store/:storeId')
    @UseGuards(RolesGuard)
    @Roles(Role.NORMAL_USER)
    @ApiOperation({ summary: 'Get current user rating for a specific store' })
    @ApiResponse({ status: 200, description: 'Current user rating for the store', type: RatingResponseDto })
    async getMyRatingForStore(
      @Request() req,
      @Param('storeId', ParseIntPipe) storeId: number,
    ): Promise<RatingResponseDto | null> {
      return this.ratingsService.getUserRatingForStore(req.user.id, storeId);
    }
  }