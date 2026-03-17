import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionDto {
  @ApiProperty({
    description: 'An array of integer numbers',
    type: [Number],
    example: [0],
  })
  permissionIds: number[];
  @ApiProperty()
  userId: number;
}
