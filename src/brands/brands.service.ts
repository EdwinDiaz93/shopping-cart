import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from 'src/shared/services';
import { BrandPaginationDto, BrandResponse } from './dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(createBrandDto: CreateBrandDto) {
    try {
      const brand = await this.prismaService.brand.create({ data: { name: createBrandDto.name, slug: this.prismaService.slugify(createBrandDto.name) } })
      return brand;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }

  async findAll(brandPaginationDto: BrandPaginationDto): Promise<BrandResponse> {
    try {
      const { page, limit } = brandPaginationDto;
      const [totalRecords, data] = await this.prismaService.$transaction(async (tx) => {
        const brandsCounts = await tx.brand.count();
        const offset: number = (page! - 1) * limit!
        const brands = await tx.brand.findMany({ skip: offset, take: brandPaginationDto.limit, orderBy: { id: 'desc' } });
        return [brandsCounts, brands];
      })
      const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / limit!) : 0
      const nextPage = (totalPages > 0) ? page === totalPages ? null : page! + 1 : null
      const prevPage = (totalPages > 0) ? page === 1 ? null : page! - 1 : null
      return {
        data,
        meta: {
          totalRecords,
          currentPage: page!,
          totalPages,
          nextPage,
          prevPage
        }
      }

    } catch (error) {
      if (error instanceof HttpException) throw error
      throw this.prismaService.handleDbError(error)
    }
  }

  async findOne(id: number) {
    try {
      const brand = await this.prismaService.brand.findUnique({ where: { id } })
      if (!brand) throw new NotFoundException(`Brand not found`);
      return brand;
    } catch (error) {
      if (error instanceof HttpException) throw error
      throw this.prismaService.handleDbError(error)
    }
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    try {
      const brandDb = await this.findOne(id);
      this.prismaService.brand.update({ where: { id: brandDb.id }, data: { ...brandDb, ...updateBrandDto } })
      return { ok: true }
    } catch (error) {
      if (error instanceof HttpException) throw error
      throw this.prismaService.handleDbError(error)
    }

  }

  async remove(id: number) {
    try {
      await this.prismaService.brand.delete({ where: { id } });
      return { ok: true };
    } catch (error) {
      if (error instanceof HttpException) throw error
      throw this.prismaService.handleDbError(error)
    }
  }
}
