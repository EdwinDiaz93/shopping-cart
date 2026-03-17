import { PartialType } from '@nestjs/swagger';
import { PaginationDto } from 'src/shared/dto';
import { RolFilters } from '../interface';

export class SearchRolDto extends PartialType(PaginationDto<RolFilters>) {}
