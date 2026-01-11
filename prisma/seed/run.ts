import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { BcryptService } from "src/common/services/bcrypt.service";
import { createUsuarioAdmin } from "./usuario-seed";

const prismaWrite = new PrismaWriteService();
const prismaRead = new PrismaReadService();
const bcryptService = new BcryptService();

createUsuarioAdmin(prismaWrite, prismaRead, bcryptService)
