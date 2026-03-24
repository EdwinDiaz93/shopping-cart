import { PartialType } from "@nestjs/swagger";
import { PaginationDto } from "src/shared/dto";
import { BrandsFilters } from "../interfaces";

export class BrandPaginationDto extends PartialType(PaginationDto<BrandsFilters>) {

}