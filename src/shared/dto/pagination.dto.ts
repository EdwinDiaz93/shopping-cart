import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto<T> {
  @ApiProperty()
  page: number;
  @ApiProperty()
  limit: number;
  @ApiProperty()
  filters?: T;
}


export class MetaDto {
  @ApiProperty()
  totalRecords: number;
  @ApiProperty()
  currentPage: number;
  @ApiProperty()
  totalPages: number;
  @ApiProperty()
  nextPage: number | null;
  @ApiProperty()
  prevPage: number | null;
}