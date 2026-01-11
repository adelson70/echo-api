import { defineConfig } from 'prisma/config';
import 'tsconfig-paths/register';

process.loadEnvFile();

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node -r tsconfig-paths/register prisma/seed/run.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
