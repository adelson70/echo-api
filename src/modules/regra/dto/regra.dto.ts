import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { context_values, app_values, extensions } from "@prisma/client";

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