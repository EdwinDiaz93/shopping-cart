import { ApiProperty } from "@nestjs/swagger";
import { MetaDto } from "src/shared/dto";





export class BrandType {
    @ApiProperty()
    name: string;
    @ApiProperty()
    slug: string;
    @ApiProperty()
    updatedAt: Date;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    id: number;
    @ApiProperty()
    imageUrl: string|null;
}


export class BrandResponse {
    @ApiProperty()
    data: BrandType[]
    @ApiProperty()
    meta: MetaDto
}
