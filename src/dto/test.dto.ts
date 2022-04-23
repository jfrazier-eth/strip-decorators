import { ApiProperty } from "@nestjs/swagger";

export class TestDto {
  @ApiProperty({
    description: "Test username",
  })
  username: string;

  password: string;
}
