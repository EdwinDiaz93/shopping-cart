import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto<T> {
  @ApiProperty()
  offset: number;
  @ApiProperty()
  limit: number;
  @ApiProperty()
  filters?: T;
}
