import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PasswordService } from "src/common/services/password.service";
import { createUsuarioAdmin } from "./usuario-seed";

const prismaWrite = new PrismaWriteService();
const prismaRead = new PrismaReadService();
const passwordService = new PasswordService();

createUsuarioAdmin(prismaWrite, prismaRead, passwordService)
