import { ApiProperty, OmitType } from "@nestjs/swagger";
import { LogActions, LogStatus, Modulos } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/client";
import { IsDate, IsEnum, IsJSON, IsOptional, IsString } from "class-validator";

export class LogDto {
    @IsString()
    @ApiProperty({
        description: 'ID do log',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'ID do usuário',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    usuario_id: string | null;

    @IsString()
    @ApiProperty({
        description: 'IP do log',
        example: '127.0.0.1',
    })
    ip: string;
    
    @IsEnum(LogStatus)
    @ApiProperty({
        description: 'Status do log',
        example: 'SUCESSO',
    })
    status: LogStatus;

    @IsEnum(LogActions)
    @ApiProperty({
        description: 'Ação do log',
        example: 'LOGIN',
    })
    acao: LogActions;

    @IsEnum(Modulos)
    @IsOptional()
    @ApiProperty({
        description: 'Módulo do log',
        example: 'SISTEMA',
    })
    modulo: Modulos | null;

    @IsJSON()
    @IsOptional()
    @ApiProperty({
        description: 'Meta data do log',
        example: { old: 'value', new: 'value' },
    })
    metaData: JsonValue | null;

    @IsDate()
    @ApiProperty({
        description: 'Data de criação do log',
        example: '2021-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @IsDate()
    @ApiProperty({
        description: 'Data de atualização do log',
        example: '2021-01-01T00:00:00.000Z',
    })
    updatedAt: Date;
}

export class CreateLogDto extends OmitType(LogDto, ['id', 'createdAt', 'updatedAt']) {}