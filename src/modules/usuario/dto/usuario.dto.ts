import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean } from "class-validator";
import { ApiProperty, OmitType, PartialType, PickType } from "@nestjs/swagger";
import { PasswordValidator } from "src/common/decorators/password.decorator";

export class UsuarioDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID do usuário',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Nome do usuário',
        example: 'João da Silva',
    })
    nome: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Email do usuário',
        example: 'joao.silva@example.com',
    })
    email: string;
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Senha do usuário',
        example: 'd8J92#kH4!l',
    })
    @PasswordValidator()
    senha: string;
    
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({
        description: 'É administrador',
        example: true,
    })
    is_admin: boolean;
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID do perfil do usuário',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    perfil_id: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Último login do usuário',
        example: '2021-01-01T00:00:00.000Z',
    })
    last_login: Date;
}

export class ListUsuarioDto extends OmitType(UsuarioDto, ['senha'] as const) {}
export class FindUsuarioDto extends OmitType(UsuarioDto, ['senha'] as const) {}