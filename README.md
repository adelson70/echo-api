# Echo API

API REST desenvolvida em NestJS para gerenciamento de recursos de telefonia e PABX, incluindo ramais, troncos, filas, regras, grupos de captura e relatórios.

## 🚀 Tecnologias

- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[Prisma](https://www.prisma.io/)** - ORM moderno para Node.js e TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[JWT](https://jwt.io/)** - Autenticação baseada em tokens
- **[Swagger](https://swagger.io/)** - Documentação interativa da API
- **[Zod](https://zod.dev/)** - Validação de schemas
- **[Socket.IO](https://socket.io/)** - Comunicação em tempo real

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- pnpm (gerenciador de pacotes)
- PostgreSQL
- Prisma CLI

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd echo-api
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://usuario:senha@localhost:5432/echo_db
JWT_SECRET_AT=seu-secret-access-token
JWT_SECRET_RT=seu-secret-refresh-token
SWAGGER_USER=admin
SWAGGER_PASS=senha
```

4. Configure o banco de dados:
```bash
# Gerar o cliente Prisma
pnpm prisma generate

# Aplicar migrations ou sincronizar o schema
pnpm prisma db push
```

## 🏃 Executando a aplicação

### Desenvolvimento
```bash
pnpm run dev
```

### Modo Watch (com hot-reload)
```bash
pnpm run start:watch
```

### Produção
```bash
# Compilar
pnpm run build

# Executar
pnpm run prod
```

### Debug
```bash
pnpm run debug
```

## 🧪 Testes

```bash
# Executar testes unitários
pnpm run test

# Executar testes em modo watch
pnpm run test:watch

# Cobertura de testes
pnpm run test:cov

# Testes end-to-end
pnpm run test:e2e
```

## 📚 Documentação da API

A documentação interativa da API está disponível através do Swagger:

- **URL**: `http://localhost:5000/docs`
- **JSON**: `http://localhost:5000/docs-json`

> **Nota**: No ambiente de desenvolvimento, o acesso ao Swagger requer autenticação básica configurada através das variáveis `SWAGGER_USER` e `SWAGGER_PASS`.

## 📁 Estrutura do Projeto

```
echo-api/
├── src/
│   ├── modules/           # Módulos da aplicação
│   │   ├── ramal/         # Gerenciamento de ramais
│   │   ├── tronco/        # Gerenciamento de troncos
│   │   ├── fila/          # Gerenciamento de filas
│   │   ├── regra/         # Regras de entrada/saída
│   │   ├── usuario/       # Gerenciamento de usuários
│   │   ├── grupo-de-captura/  # Grupos de captura
│   │   ├── relatorio/     # Relatórios
│   │   └── sistema/       # Sistema
│   ├── common/            # Recursos compartilhados
│   │   ├── guards/        # Guards (autenticação, rate limit)
│   │   ├── interceptors/  # Interceptors
│   │   ├── pipes/         # Pipes de validação
│   │   └── types/         # Tipos TypeScript
│   └── infra/             # Infraestrutura
│       ├── config/        # Configurações
│       └── database/      # Configuração do banco de dados
├── prisma/
│   └── schema/            # Schemas do Prisma
└── public/                # Arquivos estáticos
```

## 🔐 Segurança

A aplicação inclui:

- **Autenticação JWT** - Tokens de acesso e refresh
- **Rate Limiting** - Proteção contra abuso de API
- **Helmet** - Headers de segurança HTTP
- **CORS** - Configurado para permitir requisições cross-origin
- **Validação de dados** - Utilizando Zod para validação de schemas

## 📝 Scripts Disponíveis

- `pnpm run build` - Compila o projeto
- `pnpm run dev` - Inicia em modo desenvolvimento
- `pnpm run start` - Inicia a aplicação
- `pnpm run debug` - Inicia em modo debug
- `pnpm run prod` - Executa a aplicação compilada
- `pnpm run lint` - Executa o linter
- `pnpm run format` - Formata o código com Prettier
- `pnpm run reset:db` - Reseta e popula o banco de dados (desenvolvimento)

## 🌍 Variáveis de Ambiente

### Obrigatórias

- `NODE_ENV` - Ambiente de execução (development/production)
- `PORT` - Porta em que a aplicação será executada
- `DATABASE_URL` - URL de conexão com o PostgreSQL
- `JWT_SECRET_AT` - Secret para tokens de acesso JWT
- `JWT_SECRET_RT` - Secret para tokens de refresh JWT

### Opcionais

- `SWAGGER_USER` - Usuário para acesso ao Swagger (desenvolvimento)
- `SWAGGER_PASS` - Senha para acesso ao Swagger (desenvolvimento)

## 📄 Licença

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
