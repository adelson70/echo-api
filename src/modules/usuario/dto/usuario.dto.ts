import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsArray, IsObject } from "class-validator";
import { ApiProperty, OmitType, PartialType, PickType } from "@nestjs/swagger";
import { PasswordValidator } from "src/common/decorators/password.decorator";
import { PerfilDto, PermissaoDto } from "src/modules/sistema/dto/sistema.dto";

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
    @IsOptional()
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

export class ListUsuarioDto extends OmitType(
    UsuarioDto, ['senha'] as const
) {
    @IsArray()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Permissões do usuário',
        example: [{ modulo: 'usuario', criar: true, ler: true, editar: true, deletar: true }],
    })
    permissoesUsuario: PermissaoDto[];

    @IsObject()
    @IsOptional()
    @ApiProperty({
        description: 'Perfil do usuário',
        example: { nome: 'Administrador', permissoes: [{ modulo: 'usuario', criar: true, ler: true, editar: true, deletar: true }] },
        required: false,
    })
    perfil: PerfilDto | null = null;
}
export class FindUsuarioDto extends ListUsuarioDto {}
export class CreateUsuarioDto extends OmitType(UsuarioDto, ['id', 'last_login'] as const) {}
export class UpdateUsuarioDto extends PartialType(
    OmitType(UsuarioDto, ['id', 'last_login'] as const)
) {
    @IsOptional()
    declare nome: string;

    @IsOptional()
    declare email: string;

    @IsOptional()
    declare senha: string;

    @IsOptional()
    declare is_admin: boolean;

    @IsOptional()
    declare perfil_id: string;
}