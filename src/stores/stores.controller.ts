// src/stores/stores.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
    HttpStatus,
    ParseIntPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { StoreDashboardResponseDto, StoreListResponseDto } from './dto/store-response.dto';
import { StoreQueryDto } from './dto/store-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@ApiTags('stores')
@Controller('stores')
export class StoresController {
    constructor(private readonly storesService: StoresService) { }

    // Public endpoint - get stores for normal users
    @Get('public')
    @ApiOperation({ summary: 'Get public stores list (for normal users)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of stores retrieved successfully',
        type: StoreListResponseDto
    })
    async getPublicStores(
        @Query() query: StoreQueryDto,
        @Request() req?: any
    ) {
        const userId = req?.user?.id || null;
        return this.storesService.findPublicStores(query, userId);
    }

    // Admin only endpoints
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new store (Admin only)' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Store created successfully'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Store or user email already exists'
    })
    async createStore(@Body() createStoreDto: CreateStoreDto) {
        const store = await this.storesService.createStore(createStoreDto);
        return {
            message: 'Store created successfully',
            store
        };
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all stores (Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of stores retrieved successfully',
        type: StoreListResponseDto
    })
    async getAllStores(@Query() query: StoreQueryDto) {
        return this.storesService.findAllStores(query);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get store by ID (Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Store retrieved successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Store not found'
    })
    async getStoreById(@Param('id', ParseIntPipe) id: number) {
        return this.storesService.findStoreById(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update store (Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Store updated successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Store not found'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Email already taken by another store'
    })
    async updateStore(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStoreDto: UpdateStoreDto
    ) {
        const store = await this.storesService.updateStore(id, updateStoreDto);
        return {
            message: 'Store updated successfully',
            store
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete store (Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Store deleted successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Store not found'
    })
    async deleteStore(@Param('id', ParseIntPipe) id: number) {
        return this.storesService.deleteStore(id);
    }

    // Store owner endpoints
    @Get('dashboard/my-store')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.STORE_OWNER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get store dashboard (Store owner only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Store dashboard data retrieved successfully',
        type: StoreDashboardResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Store not found'
    })
    async getStoreDashboard(@Request() req) {
        return this.storesService.getStoreDashboard(req.user.id);
    }

    @Get('stats/overview')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get store statistics (Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Store statistics retrieved successfully'
    })
    async getStoreStats() {
        return this.storesService.getStoreStats();
    }
}