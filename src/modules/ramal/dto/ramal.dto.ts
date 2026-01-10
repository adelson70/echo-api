import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { ApiProperty, OmitType, PartialType, PickType } from "@nestjs/swagger";
import { PasswordValidator } from "src/common/decorators/password.decorator";

export class RamalDto {
    @IsString()
    @ApiProperty({
        description: 'Ramal',
        example: '1001',
    })
    ramal: string;

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
    declare ramal: string;

    @IsNotEmpty()
    declare senha: string;

    @IsNotEmpty()
    declare regraSaida: string;

    @IsNotEmpty()
    declare maximoContatos: number;
}

export class CreateLoteRamalDto extends PartialType(
    OmitType(RamalDto, ['ramal', 'senha'] as const)
) {
    @IsNumber()
    @ApiProperty({
        description: 'Quantidade de ramais a serem criados',
        example: 10,
    })
    quantidadeRamais: number;

    @IsString()
    @ApiProperty({
        description: 'Ramal inicial para a sequência',
        example: '1001',
    })
    declare ramalInicial: string;
}

export class UpdateRamalDto extends PartialType(
    OmitType(RamalDto, ['ramal'] as const)
) {
    @IsOptional()
    declare senha: string;

    @IsOptional()
    declare regraSaida: string;

    @IsOptional()
    declare maximoContatos: number;
}

export class DeleteRamalDto extends PickType(RamalDto, ['ramal']) {}
export class FindRamalDto extends PickType(RamalDto, ['ramal']) {}
export class ListRamalDto extends PickType(RamalDto, ['ramal']) {}