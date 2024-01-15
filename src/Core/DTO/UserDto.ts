import { ApiProperty } from '@nestjs/swagger';

export default class UserDto {
    @ApiProperty({ required: false })
    id?: number;

    @ApiProperty({ required: false, nullable: true, default: null })
    birthdayDate?: Date = null;
}
