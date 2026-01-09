import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { ApiProperty, OmitType, PartialType, PickType } from "@nestjs/swagger";
import { PasswordValidator } from "src/common/decorators/password.decorator";

export class RamalDto {
    @IsString()
    @ApiProperty({
        description: 'Usuário do ramal',
        example: '1001',
    })
    usuario: string;

    @IsString()
    @ApiProperty({
        description: 'Senha do ramal',
        example: 'd8J92#kH4!l',
    })
    @PasswordValidator()
    senha: string;

    @IsString()
    @ApiProperty({
        description: 'Regra de saída do ramal',
        example: 'geral',
    })
    regraSaida: string;

    @IsNumber()
    @ApiProperty({
        description: 'Máximo de contatos do ramal',
        example: 10,
    })
    maximoContatos: number;
    
    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'DOD do ramal',
        example: '55999999999',
    })
    dod: string | null;
}

export class CreateRamalDto extends RamalDto {
    @IsNotEmpty()
    declare usuario: string;

    @IsNotEmpty()
    declare senha: string;

    @IsNotEmpty()
    declare regraSaida: string;

    @IsNotEmpty()
    declare maximoContatos: number;
}

export class UpdateRamalDto extends PartialType(
    OmitType(RamalDto, ['usuario'] as const)
) {
    @IsOptional()
    declare senha: string;

    @IsOptional()
    declare regraSaida: string;

    @IsOptional()
    declare maximoContatos: number;
}

export class DeleteRamalDto extends PickType(RamalDto, ['usuario']) {}
export class FindRamalDto extends PickType(RamalDto, ['usuario']) {}
export class ListRamalDto extends PickType(RamalDto, ['usuario']) {}