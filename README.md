# Echo API

<div align="center">

![Echo](https://img.shields.io/badge/Echo-PABX%20Management-blue?style=for-the-badge)
![NestJS](https://img.shields.io/badge/NestJS-11.0-red?style=flat-square&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**A solução empresarial para gerenciamento centralizado de sistemas telefônicos e PABX**

[Sobre](#sobre) • [Recursos](#recursos) • [Instalação](#instalação) • [Documentação](#documentação) • [Contribuição](#contribuição)

</div>

---

## Sobre

**Echo API** é uma plataforma robusta, escalável e segura desenvolvida em **NestJS** para gerenciamento completo de infraestrutura de telefonia corporativa. Oferece controle centralizado de ramais, troncos, filas, regras de roteamento e muito mais, permitindo que empresas otimizem suas operações de comunicação com uma API REST moderna e bem documentada.

Ideal para empresas que necessitam de uma solução profissional para gerenciar múltiplas linhas, ramais, grupos de atendimento e relatórios detalhados em tempo real.

## Recursos

### 🎯 Funcionalidades Principais

- **Gerenciamento de Ramais** - Configuração e controle centralizado de números de ramal
- **Gerenciamento de Troncos** - Administração de linhas e conexões telefônicas
- **Filas de Atendimento** - Criar e gerenciar filas de chamadas com roteamento inteligente
- **Regras de Roteamento** - Definir regras avançadas de entrada e saída de chamadas
- **Grupos de Captura** - Organizar ramais em grupos para atendimento em equipe
- **Gerenciamento de Usuários** - Controle de acesso e permissões de usuários
- **Relatórios Detalhados** - Análises e estatísticas de chamadas e operações
- **Auditoria Completa** - Registro detalhado de todas as operações do sistema

### 🔒 Segurança em Primeiro Lugar

- ✅ Autenticação JWT com tokens de acesso e refresh
- ✅ Rate limiting para proteção contra abuso
- ✅ Headers de segurança HTTP via Helmet
- ✅ CORS configurável
- ✅ Validação rigorosa de dados com Zod
- ✅ Criptografia de senhas com Bcrypt
- ✅ Logs de auditoria completos

### ⚡ Performance e Escalabilidade

- Arquitetura modular e desacoplada
- ORM moderno (Prisma) para operações de banco otimizadas
- Interceptadores para processamento centralizado
- Suporte a comunicação em tempo real via Socket.IO
- Graceful shutdown para encerramento seguro da aplicação

---

## 🚀 Tecnologias

| Tecnologia | Descrição | Versão |
|-----------|-----------|--------|
| [NestJS](https://nestjs.com/) | Framework Node.js progressivo | 11.0+ |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática para JavaScript | 5.7+ |
| [Prisma](https://www.prisma.io/) | ORM moderno para Node.js | 7.0+ |
| [PostgreSQL](https://www.postgresql.org/) | Banco de dados relacional | 15+ |
| [JWT](https://jwt.io/) | Autenticação stateless | - |
| [Swagger/OpenAPI](https://swagger.io/) | Documentação interativa | 11.2+ |
| [Zod](https://zod.dev/) | Validação de schemas TypeScript | 4.1+ |
| [Socket.IO](https://socket.io/) | Comunicação em tempo real | 4.8+ |
| [Helmet](https://helmetjs.github.io/) | Segurança HTTP | 8.1+ |

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de que possui:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (gerenciador de pacotes otimizado) - Instale com: `npm install -g pnpm`
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **Git** para versionamento

## 🔧 Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd echo-api
```

### 2. Instale as Dependências

```bash
pnpm install
```

### 3. Configure o Banco de Dados

Crie um banco de dados PostgreSQL:

```bash
createdb echo_db
```

### 4. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Ambiente
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://usuario:senha@localhost:5432/echo_db

# JWT - Gere secrets aleatórios seguros (mín. 32 caracteres)
JWT_SECRET_AT=seu-secret-access-token-aqui-minimo-32-caracteres
JWT_SECRET_RT=seu-secret-refresh-token-aqui-minimo-32-caracteres

# Swagger (apenas desenvolvimento)
SWAGGER_USER=admin
SWAGGER_PASS=senha-segura

# SSH (Opcional - para integração com VoIP)
SSH_HOST=seu-host-ssh
SSH_PORT=22
SSH_USERNAME=seu-usuario
SSH_PASSWORD=sua-senha
```

### 5. Setup do Banco de Dados

```bash
# Gerar cliente Prisma
pnpm exec prisma generate

# Executar migrations
pnpm prisma:push

# (Opcional) Popular banco com dados seed
pnpm prisma:seed
```

---

## 🏃 Executando a Aplicação

### Modo Desenvolvimento (Recomendado para Dev)

```bash
pnpm run dev
```

A aplicação estará disponível em `http://localhost:5000`

### Produção

```bash
# 1. Compilar o projeto
pnpm run build

# 2. Executar versão compilada
pnpm run start
```

### Debug

```bash
pnpm run debug
```

### Linting e Formatação

```bash
# Executar ESLint
pnpm run lint

# Formatar código com Prettier
pnpm run format
```

---

## 📚 Documentação da API

### Swagger UI (Documentação Interativa)

Após iniciar a aplicação, acesse:

- **URL Principal**: [`http://localhost:5000/docs`](http://localhost:5000/docs)
- **JSON Schema**: [`http://localhost:5000/docs-json`](http://localhost:5000/docs-json)

> **Autenticação**: No desenvolvimento, use as credenciais configuradas em `SWAGGER_USER` e `SWAGGER_PASS`

### Endpoints Principais

#### 🔐 Autenticação
- `POST /auth/login` - Realizar login
- `POST /auth/refresh` - Renovar token de acesso
- `POST /auth/logout` - Fazer logout

#### ☎️ Ramais
- `GET /ramal` - Listar todos os ramais
- `GET /ramal/:id` - Buscar ramal específico
- `POST /ramal` - Criar novo ramal
- `PUT /ramal/:id` - Atualizar ramal
- `DELETE /ramal/:id` - Deletar ramal

#### 🚀 Troncos
- `GET /tronco` - Listar troncos
- `POST /tronco` - Criar tronco
- `PUT /tronco/:id` - Atualizar tronco
- `DELETE /tronco/:id` - Deletar tronco

#### 📞 Filas
- `GET /fila` - Listar filas
- `POST /fila` - Criar fila
- `PUT /fila/:id` - Atualizar fila
- `DELETE /fila/:id` - Deletar fila

#### 👥 Usuários
- `GET /usuario` - Listar usuários
- `POST /usuario` - Criar usuário
- `PUT /usuario/:id` - Atualizar usuário
- `DELETE /usuario/:id` - Deletar usuário

#### 📊 Relatórios
- `GET /relatorio` - Gerar relatórios
- `GET /relatorio/:tipo` - Relatório específico

Consulte a documentação completa no Swagger para mais detalhes.

---

## 📁 Arquitetura e Estrutura do Projeto

```
echo-api/
├── src/
│   ├── modules/                    # Módulos de funcionalidades
│   │   ├── auth/                   # Autenticação e autorização
│   │   ├── usuario/                # Gerenciamento de usuários
│   │   ├── ramal/                  # Gerenciamento de ramais
│   │   ├── tronco/                 # Gerenciamento de troncos
│   │   ├── fila/                   # Gerenciamento de filas
│   │   ├── regra/                  # Regras de roteamento
│   │   ├── grupo-de-captura/       # Grupos de ramais
│   │   ├── relatorio/              # Geração de relatórios
│   │   ├── perfil/                 # Perfis e permissões
│   │   ├── log/                    # Logs de operações
│   │   ├── sistema/                # Configurações do sistema
│   │   ├── ami/                    # Integração com AMI (Asterisk)
│   │   └── README-MODULES.md       # Documentação dos módulos
│   │
│   ├── common/                     # Código compartilhado
│   │   ├── guards/                 # Guards (autenticação, rate limit)
│   │   ├── interceptors/           # Interceptadores (logging, resposta)
│   │   ├── pipes/                  # Pipes de validação
│   │   ├── decorators/             # Decoradores customizados
│   │   ├── services/               # Serviços compartilhados
│   │   └── types/                  # Tipos TypeScript globais
│   │
│   ├── infra/                      # Camada de infraestrutura
│   │   ├── config/                 # Configurações (variáveis de ambiente)
│   │   ├── database/               # Configuração Prisma
│   │   └── ssh/                    # Integração SSH para VoIP
│   │
│   ├── app.module.ts               # Módulo raiz
│   ├── app.controller.ts           # Controlador raiz
│   └── main.ts                     # Ponto de entrada da aplicação
│
├── prisma/
│   ├── migrations/                 # Histórico de migrations
│   ├── schema/                     # Schemas Prisma (por domínio)
│   │   ├── usuarios.prisma
│   │   ├── pjsip_*.prisma         # Schemas PJSIP
│   │   └── ...
│   └── seed/                       # Scripts de seed do banco
│
├── public/                         # Arquivos estáticos
├── test/                           # Testes (e2e)
│
├── package.json                    # Dependências
├── tsconfig.json                   # Configuração TypeScript
├── nest-cli.json                   # Configuração NestJS
├── prisma.config.ts                # Configuração Prisma
└── README.md                       # Este arquivo
```

### Padrão de Módulos

Cada módulo segue a arquitetura padrão NestJS:

```
modulo/
├── modulo.module.ts              # Declaração do módulo
├── modulo.controller.ts          # Rotas e requisições HTTP
├── modulo.service.ts             # Lógica de negócio
├── modulo.types.ts               # Tipos TypeScript
├── dto/                          # Data Transfer Objects
│   └── modulo.dto.ts
└── entities/                     # Entidades (opcionais)
    └── modulo.entity.ts
```

---

## 🔐 Segurança

Echo API implementa múltiplas camadas de segurança:

### Autenticação & Autorização
- ✅ **JWT (JSON Web Tokens)** com tokens de acesso (curta duração) e refresh (longa duração)
- ✅ **Guards de Autorização** para proteção de rotas
- ✅ **Controle de Permissões** baseado em perfis de usuário
- ✅ **Decoradores Customizados** para verificações específicas

### Proteção da API
- ✅ **Rate Limiting** implementado para prevenir abuso
- ✅ **CORS** configurável para requisições cross-origin
- ✅ **Helmet** para headers de segurança HTTP
- ✅ **Graceful Shutdown** para encerramento seguro

### Validação & Sanitização
- ✅ **Zod** para validação de schemas em tempo de execução
- ✅ **Pipes de Validação** customizados
- ✅ **UUID Validation** para IDs
- ✅ **Sanitização de Entrada** contra injeção

### Armazenamento Seguro
- ✅ **Bcrypt** para hashing de senhas (10+ rounds)
- ✅ **Variáveis de Ambiente** para secrets
- ✅ **Audited Logging** para rastreamento de operações

---

## 🧪 Testes

```bash
# Testes unitários
pnpm run test

# Testes em modo watch
pnpm run test:watch

# Cobertura de testes
pnpm run test:cov

# Testes end-to-end (E2E)
pnpm run test:e2e
```

---

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm run dev` | Inicia em modo desenvolvimento com hot-reload |
| `pnpm run build` | Compila o projeto para produção |
| `pnpm run start` | Inicia a aplicação compilada |
| `pnpm run debug` | Inicia com debugger NodeJS |
| `pnpm run lint` | Executa ESLint e corrige problemas |
| `pnpm run format` | Formata código com Prettier |
| `pnpm exec prisma generate` | Gera cliente Prisma |
| `pnpm prisma:push` | Sincroniza schema com banco de dados |
| `pnpm prisma:seed` | Executa script de seed |
| `pnpm test` | Executa testes unitários |
| `pnpm test:watch` | Testes em modo watch |
| `pnpm test:cov` | Testes com cobertura |
| `pnpm test:e2e` | Testes end-to-end |

---

## 🌍 Variáveis de Ambiente

### Variáveis Obrigatórias

```env
NODE_ENV              # development ou production
PORT                  # Porta da aplicação (padrão: 5000)
DATABASE_URL          # URL de conexão PostgreSQL
JWT_SECRET_AT         # Secret para access token (mín. 32 caracteres)
JWT_SECRET_RT         # Secret para refresh token (mín. 32 caracteres)
```

### Variáveis Opcionais

```env
SWAGGER_USER          # Usuário Swagger (desenvolvimento)
SWAGGER_PASS          # Senha Swagger (desenvolvimento)
SSH_HOST              # Host SSH para VoIP
SSH_PORT              # Porta SSH (padrão: 22)
SSH_USERNAME          # Usuário SSH
SSH_PASSWORD          # Senha SSH
LOG_LEVEL             # Nível de log (debug, log, warn, error)
```

### Gerar Secrets Seguros

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

---

## 🚀 Deploy

### Docker (Recomendado)

```bash
# Build da imagem
docker build -t echo-api .

# Executar container
docker run -p 5000:5000 --env-file .env echo-api
```

### PM2 (Produção)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar com PM2
pm2 start ecosystem.config.js

# Ver logs
pm2 logs echo-api

# Reiniciar
pm2 restart echo-api
```

---

## 📊 Monitoramento

A aplicação inclui:

- **Audit Log Interceptor** - Registra todas as operações
- **Response Interceptor** - Formata respostas consistentes
- **Rate Limit Guard** - Monitora requisições
- **Logger Centralizado** - Via NestJS Logger

Consulte os logs em tempo real durante desenvolvimento com `pnpm run dev`

---

## 🤝 Contribuindo

1. Faça um Fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- Mantenha a consistência com ESLint
- Execute `pnpm run format` antes de commit
- Escreva testes para novas features
- Documente mudanças no Swagger

---

## 🐛 Troubleshooting

### Problema: "Conexão recusada" ao banco de dados
```bash
# Verifique se PostgreSQL está rodando
pg_isready

# Teste a conexão
psql $DATABASE_URL
```

### Problema: Porta já em uso
```bash
# Mude a porta ou libere a porta atual
lsof -i :5000  # Listar processo
kill -9 <PID>   # Encerrar processo
```

### Problema: Módulo não encontrado
```bash
# Reconstrua o Prisma
pnpm exec prisma generate

# Limpe node_modules e reinstale
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

Baseado em [NestJS](https://github.com/nestjs/nest) - Licença MIT

---

## 📞 Suporte

- 📧 Email: [seu-email@exemplo.com]
- 🐛 Issues: [Reportar um bug](../../issues)
- 💡 Discussões: [Fazer uma pergunta](../../discussions)

---

<div align="center">

Desenvolvido com ❤️ usando **NestJS** e **TypeScript**

[⬆ Voltar ao Topo](#echo-api)

</div>
