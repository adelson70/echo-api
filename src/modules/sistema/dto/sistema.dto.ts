import { IsString, IsNotEmpty, IsBoolean, IsArray, ValidateNested, IsUUID, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { Modulos } from "@prisma/client";

export class PermissaoDto {
    @IsUUID()
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID da permissão',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @IsEnum(Modulos)
    @IsNotEmpty()
    @ApiProperty({
        description: 'Módulo da permissão',
        example: Modulos.USUARIO,
    })
    modulo: Modulos;

    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Permissão para criar',
        example: true,
    })
    criar: boolean;

    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Permissão para ler',
        example: true,
    })
    ler: boolean;

    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Permissão para editar',
        example: true,
    })
    editar: boolean;

    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Permissão para deletar',
        example: true,
    })
    deletar: boolean;
}

export class PerfilDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Nome do perfil',
        example: 'Administrador',
    })
    nome: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissaoDto)
    @ApiProperty({
        description: 'Permissões do perfil',
        type: [PermissaoDto],
        example: [{ modulo: 'usuario', criar: true, ler: true, editar: true, deletar: true }],
    })
    permissoes: PermissaoDto[];
}