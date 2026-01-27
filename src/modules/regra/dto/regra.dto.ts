import { Equals, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { context_values, app_values, extensions, $Enums } from "@prisma/client";
import { Type } from "class-transformer";

export class RegraCompletoDto {
    @IsUUID()
    @ApiProperty({
        description: 'ID da regra',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @IsString()
    @ApiProperty({
        description: 'Nome da regra',
        example: 'Regra 1',
    })
    nome: string;

    @IsString()
    @ApiProperty({
        description: 'Descrição da regra',
        example: 'Regra para atender chamadas de teste',
    })
    descricao: string;

    @IsEnum(context_values)
    @IsNotEmpty()
    @ApiProperty({
        description: 'Tipo de regra',
        example: context_values.teste,
    })
    tipo: context_values;

    @IsArray()
    @ApiProperty({
        description: 'Regras da regra',
        example: [
            {
                id: 1,
                rota: '100.',
                prioridade: 1,
                acao: app_values.Dial,
                parametros: 'PJSIP/1001',
            },
            {
                id: 2,
                rota: '_X.',
                prioridade: 1,
                acao: app_values.Answer,
                parametros: 'PJSIP/1001',
            },
        ],
    })
    regra: RegraDto[];
}

export class RegraDto {
    @IsNumber()
    @ApiProperty({
        description: 'ID da regra',
        example: 1,
    })
    id: number;

    @IsString()
    @ApiProperty({
        description: 'Rota da regra',
        example: '_X.',
    })
    rota: string;

    @IsNumber()
    @ApiProperty({
        description: 'Prioridade da regra',
        example: 1,
    })
    prioridade: number;

    @IsEnum(app_values)
    @IsNotEmpty()
    @ApiProperty({
        description: 'Ação da regra',
        example: app_values.Answer,
    })
    acao: app_values;

    @IsString()
    @ApiProperty({
        description: 'Parâmetros da regra',
        example: 'PJSIP/1001',
    })
    parametros: string;
}

export class ListRegraDto extends RegraCompletoDto {}
export class FindRegraDto extends RegraCompletoDto {}
export class RegraDtoSemId extends OmitType(RegraDto, ['id'] as const) {}

export class CreateRegraDto extends PartialType(
    OmitType(RegraCompletoDto, ['id', 'regra'] as const)
) {
    @IsNotEmpty()
    declare nome: string;

    @IsOptional()
    declare descricao: string;

    @IsEnum(context_values)
    @IsNotEmpty()
    declare tipo: context_values;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RegraDtoSemId)
    regra: RegraDtoSemId[];
}

export class UpdateRegraDto extends PartialType(
    OmitType(CreateRegraDto, ['tipo'] as const)
) {
    @IsOptional()
    declare nome: string;

    @IsOptional()
    declare descricao: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RegraDto)
    regra: RegraDto[];
}