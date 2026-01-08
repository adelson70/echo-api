import { defineConfig } from 'prisma/config';

process.loadEnvFile();

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seeds/run.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
