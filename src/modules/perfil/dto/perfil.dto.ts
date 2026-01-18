import { ApiProperty, OmitType } from "@nestjs/swagger";
import { Modulos } from "@prisma/client";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { PermissaoDto } from "src/modules/sistema/dto/sistema.dto";

export class PerfilDto {
    @IsUUID()
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID do perfil',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Nome do perfil',
        example: 'Administrador',
    })
    nome: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Descrição do perfil',
        example: 'Perfil de administrador',
    })
    descricao: string;

    @IsArray()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Permissões do perfil',
        example: [{ modulo: Modulos.USUARIO, criar: true, ler: true, editar: true, deletar: true }],
    })
    permissoes: PermissaoDto[];

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Quantidade de usuários vinculados ao perfil',
        example: 1,
    })
    quantidadeUsuarios: number;
}

export class ListPerfilDto extends OmitType(PerfilDto, ['permissoes']) {}
export class FindPerfilDto extends PerfilDto {}