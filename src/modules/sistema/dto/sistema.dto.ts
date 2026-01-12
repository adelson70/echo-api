import { IsString, IsNotEmpty, IsBoolean, IsArray, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class PermissaoDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Módulo da permissão',
        example: 'usuario',
    })
    modulo: string;

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