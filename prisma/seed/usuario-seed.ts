import type { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import type { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import type { PasswordService } from "src/common/services/password.service";

const usuarioAdmin = JSON.parse(process.env.USUARIO_ADMIN_SEED || '[]');

export async function createUsuarioAdmin(
    prismaWrite: PrismaWriteService, 
    prismaRead: PrismaReadService,
    passwordService: PasswordService
): Promise<void> {
    try {
    const usuario = await prismaRead.usuario.findUnique({
        where: {
            email: usuarioAdmin.email,
            is_admin: true,
        },
    });

    if (usuario) {
        console.log('Usuário admin já existe');
        return;
    }

    console.log('Criando usuário admin');

    const senhaHash = await passwordService.generateHash(usuarioAdmin.senha);
    usuarioAdmin.senha = senhaHash;

    await prismaWrite.usuario.create({
        data: {
            ...usuarioAdmin,
            is_admin: true,
        }
    }).then(() => {
        console.log('Usuário admin criado com sucesso');
    })
    } catch (error) {
        console.error('Erro ao criar usuário admin', error);
        throw error;
    }
}