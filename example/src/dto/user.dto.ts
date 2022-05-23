import { ApiProperty } from "@nestjs/swagger";

/**
 * This is an example user DTO.
 */
export class UserDto {
  /**
   * Field with decorator.
   */
  @ApiProperty({
    description: "Test username",
  })
  username: string;

  /**
   * Field without decorator.
   */
  password: string;
}
