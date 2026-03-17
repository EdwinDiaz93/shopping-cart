import { ApiProperty } from '@nestjs/swagger';

export class AssignRolDto {
  @ApiProperty({
    description: 'An array of integer numbers',
    type: [Number],
    example: [0],
  })
  roleIds: number[];
  @ApiProperty()
  userId: number;
}
