import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infra/database/prisma/prisma.service";

@Injectable()
export class GrupoDeCapturaService {
    constructor(private readonly prisma: PrismaService) {}

}
