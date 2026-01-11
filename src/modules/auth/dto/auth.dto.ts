import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({
        description: 'Email',
        example: 'admin@admin.com',
    })
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Password',
        example: 'admin',
    })
    password: string;
}