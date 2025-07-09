// src/stores/stores.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateStoreDto } from './dto/create-store.dto';
import { StoreQueryDto } from './dto/store-query.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async createStore(createStoreDto: CreateStoreDto) {
    const { name, email, address, ownerId } = createStoreDto;

    // Check if store email already exists
    const existingStore = await this.prisma.store.findUnique({
      where: { email },
    });

    if (existingStore) {
      throw new ConflictException('Store with this email already exists');
    }

    // Check if owner exists
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException(`Owner with ID ${ownerId} not found`);
    }

    // Create store
    const store = await this.prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            role: true,
          },
        },
      },
    });

    return store;
  }

  async findAllStores(query: StoreQueryDto) {
    const {
      name,
      email,
      address,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    } else {
      if (name) where.name = { contains: name, mode: 'insensitive' };
      if (email) where.email = { contains: email, mode: 'insensitive' };
      if (address) where.address = { contains: address, mode: 'insensitive' };
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              address: true,
              role: true
            }
          },
          ratings: {
            select: {
              rating: true
            }
          }
        }
      }),
      this.prisma.store.count({ where })
    ]);

    // Calculate average rating for each store
    const storesWithRatings = stores.map(store => ({
      ...store,
      averageRating: store.ratings.length > 0 
        ? parseFloat((store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length).toFixed(1))
        : 0,
      totalRatings: store.ratings.length,
      ratings: undefined // Remove ratings array from response
    }));

    return {
      stores: storesWithRatings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findStoreById(id: number) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            role: true
          }
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Calculate average rating
    const averageRating = store.ratings.length > 0 
      ? parseFloat((store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length).toFixed(1))
      : 0;

    return {
      ...store,
      averageRating,
      totalRatings: store.ratings.length
    };
  }

  async updateStore(id: number, updateStoreDto: UpdateStoreDto) {
    const { name, email, address } = updateStoreDto;

    // Check if store exists
    const existingStore = await this.prisma.store.findUnique({
      where: { id }
    });

    if (!existingStore) {
      throw new NotFoundException('Store not found');
    }

    // Check if email is already taken by another store
    if (email && email !== existingStore.email) {
      const emailTaken = await this.prisma.store.findUnique({
        where: { email }
      });

      if (emailTaken) {
        throw new ConflictException('Email already taken by another store');
      }
    }

    return await this.prisma.store.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(address !== undefined && { address })
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            role: true
          }
        }
      }
    });
  }

  async deleteStore(id: number) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: { owner: true }
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Delete store and owner in transaction
    await this.prisma.$transaction(async (tx) => {
      // Delete store (ratings will be deleted due to cascade)
      await tx.store.delete({
        where: { id }
      });

      // Delete owner user
      await tx.user.delete({
        where: { id: store.ownerId }
      });
    });

    return { message: 'Store and owner deleted successfully' };
  }

  async findPublicStores(query: StoreQueryDto, userId?: number) {
    const {
      name,
      address,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    } else {
      if (name) where.name = { contains: name, mode: 'insensitive' };
      if (address) where.address = { contains: address, mode: 'insensitive' };
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          address: true,
          ratings: {
            select: {
              rating: true,
              userId: true
            }
          }
        }
      }),
      this.prisma.store.count({ where })
    ]);

    // Calculate ratings and user-specific data
    const storesWithRatings = stores.map(store => {
      const averageRating = store.ratings.length > 0 
        ? parseFloat((store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length).toFixed(1))
        : 0;
      
      const userRating = userId 
        ? store.ratings.find(r => r.userId === userId)?.rating || null
        : null;

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        averageRating,
        totalRatings: store.ratings.length,
        userRating
      };
    });

    return {
      stores: storesWithRatings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getStoreDashboard(userId: number) {
    // Get store owned by this user
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Calculate average rating
    const averageRating = store.ratings.length > 0 
      ? parseFloat((store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length).toFixed(1))
      : 0;

    return {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings: store.ratings.length
      },
      ratings: store.ratings.map(rating => ({
        id: rating.id,
        rating: rating.rating,
        createdAt: rating.createdAt,
        user: rating.user
      }))
    };
  }

  async getStoreStats() {
    const totalStores = await this.prisma.store.count();
    const totalRatings = await this.prisma.rating.count();
    
    return {
      totalStores,
      totalRatings
    };
  }
}