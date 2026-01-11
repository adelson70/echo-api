import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LogService } from "./log.service";
import { LogDto } from "./dto/log.dto";

@ApiTags('Log')
@Controller('log')
export class LogController {
    constructor(private readonly logService: LogService) {}

    @Get()
    @ApiOperation({ summary: 'Listar todos os logs' })
    @ApiResponse({
        status: 200,
        description: 'Logs listados com sucesso',
        type: LogDto,
    })
    async getAllLogs(): Promise<LogDto[]> {
        return await this.logService.getAll();
    }
}
