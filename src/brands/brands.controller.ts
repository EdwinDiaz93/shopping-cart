import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandPaginationDto, CreateBrandDto, UpdateBrandDto } from './dto';
import { Permission } from 'src/auth/decorators';
import { ValidPermissions } from 'src/auth/interfaces';


@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) { }

  @Post()
  @Permission(ValidPermissions.brandsCreate)
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Post('search')
  @Permission(ValidPermissions.brandsRead)
  findAll(@Body() brandPaginationDto: BrandPaginationDto) {
    return this.brandsService.findAll(brandPaginationDto);
  }

  @Get(':id')
  @Permission(ValidPermissions.brandsRead)
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(+id);
  }

  @Patch(':id')
  @Permission(ValidPermissions.brandsUpdate)
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(+id, updateBrandDto);
  }

  @Delete(':id')
  @Permission(ValidPermissions.brandsDelete)
  remove(@Param('id') id: string) {
    return this.brandsService.remove(+id);
  }
}
