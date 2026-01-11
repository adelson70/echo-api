import { Injectable } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaRead: PrismaReadService, 
        private readonly prismaWrite: PrismaWriteService) 
    {}

}
