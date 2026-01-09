#!/usr/bin/env python3
"""
Script para criar novos módulos NestJS seguindo o padrão do projeto.
"""

import os
import re
from pathlib import Path

def to_pascal_case(name: str) -> str:
    """Converte nome para PascalCase"""
    # Remove caracteres especiais e divide por espaços, hífens ou underscores
    words = re.split(r'[\s\-_]+', name)
    # Capitaliza cada palavra
    return ''.join(word.capitalize() for word in words if word)

def to_camel_case(name: str) -> str:
    """Converte nome para camelCase"""
    pascal = to_pascal_case(name)
    return pascal[0].lower() + pascal[1:] if pascal else name.lower()

def to_kebab_case(name: str) -> str:
    """Converte nome para kebab-case"""
    # Insere hífen antes de letras maiúsculas (exceto a primeira)
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1-\2', name)
    # Insere hífen antes de letras maiúsculas que seguem minúsculas ou números
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1-\2', s1)
    return s2.lower()

def create_module_files(module_name: str, base_path: Path):
    """Cria todos os arquivos do módulo"""
    
    pascal_name = to_pascal_case(module_name)
    camel_name = to_camel_case(module_name)
    kebab_name = to_kebab_case(module_name)
    
    module_dir = base_path / kebab_name
    dto_dir = module_dir / 'dto'
    
    # Cria diretórios
    module_dir.mkdir(parents=True, exist_ok=True)
    dto_dir.mkdir(parents=True, exist_ok=True)
    
    # Template do Module
    module_content = f"""import {{ Module }} from "@nestjs/common";
import {{ {pascal_name}Controller }} from "./{kebab_name}.controller";
import {{ {pascal_name}Service }} from "./{kebab_name}.service";
import {{ PrismaModule }} from "src/infra/database/prisma/prisma.module";

@Module({{
    imports: [PrismaModule],
    controllers: [{pascal_name}Controller],
    providers: [{pascal_name}Service],
}})
export class {pascal_name}Module {{}}
"""
    
    # Template do Service
    service_content = f"""import {{ Injectable }} from "@nestjs/common";
import {{ PrismaService }} from "src/infra/database/prisma/prisma.service";

@Injectable()
export class {pascal_name}Service {{
    constructor(private readonly prisma: PrismaService) {{}}

}}
"""
    
    # Template do Controller
    controller_content = f"""import {{ Controller, Get }} from "@nestjs/common";
import {{ ApiTags }} from "@nestjs/swagger";
import {{ {pascal_name}Service }} from "./{kebab_name}.service";

@ApiTags('{pascal_name}')
@Controller('{kebab_name}')
export class {pascal_name}Controller {{
    constructor(private readonly {camel_name}Service: {pascal_name}Service) {{}}

    @Get()
    retorna(){{
        return '{kebab_name} ok';
    }}
}}
"""
    
    # Template do DTO (vazio como no tronco)
    dto_content = ""
    
    # Escreve os arquivos
    (module_dir / f"{kebab_name}.module.ts").write_text(module_content)
    (module_dir / f"{kebab_name}.service.ts").write_text(service_content)
    (module_dir / f"{kebab_name}.controller.ts").write_text(controller_content)
    (dto_dir / f"{kebab_name}.dto.ts").write_text(dto_content)
    
    print(f"✓ Arquivos criados em: {module_dir}")
    print(f"  - {kebab_name}.module.ts")
    print(f"  - {kebab_name}.service.ts")
    print(f"  - {kebab_name}.controller.ts")
    print(f"  - dto/{kebab_name}.dto.ts")
    
    return pascal_name, kebab_name

def update_app_module(app_module_path: Path, pascal_name: str, kebab_name: str):
    """Atualiza o app.module.ts para importar o novo módulo"""
    
    if not app_module_path.exists():
        print(f"⚠ Arquivo {app_module_path} não encontrado. Você precisará importar manualmente.")
        return
    
    content = app_module_path.read_text()
    
    # Verifica se o módulo já está importado
    if f"{pascal_name}Module" in content:
        print(f"⚠ O módulo {pascal_name}Module já está importado no app.module.ts")
        return
    
    lines = content.split('\n')
    new_lines = []
    import_added = False
    module_added = False
    
    # Adiciona o import após a última linha de import de módulo
    for i, line in enumerate(lines):
        new_lines.append(line)
        
        # Adiciona o import após encontrar a última linha de import de módulo
        if not import_added and re.match(r"import \{ .*Module \} from '\./modules/", line):
            # Verifica se a próxima linha não é outro import de módulo
            if i + 1 < len(lines) and not re.match(r"import \{ .*Module \} from '\./modules/", lines[i + 1]):
                new_lines.append(f"import {{ {pascal_name}Module }} from './modules/{kebab_name}/{kebab_name}.module';")
                import_added = True
    
    # Se não encontrou onde adicionar o import, adiciona após o último import
    if not import_added:
        # Procura a última linha de import
        for i in range(len(new_lines) - 1, -1, -1):
            if new_lines[i].startswith('import '):
                new_lines.insert(i + 1, f"import {{ {pascal_name}Module }} from './modules/{kebab_name}/{kebab_name}.module';")
                import_added = True
                break
    
    content = '\n'.join(new_lines)
    
    # Adiciona no array de imports do @Module
    # Procura pelo padrão: imports: [ ... ]
    imports_pattern = r"(imports:\s*\[)([^\]]*)(\])"
    match = re.search(imports_pattern, content, re.DOTALL)
    
    if match:
        imports_content = match.group(2)
        # Encontra a última linha que contém um módulo (não vazia e não comentário)
        lines = imports_content.split('\n')
        last_module_line_idx = -1
        
        for i in range(len(lines) - 1, -1, -1):
            line = lines[i].strip()
            if line and not line.startswith('//') and ('Module' in line or 'register' in line):
                last_module_line_idx = i
                break
        
        if last_module_line_idx >= 0:
            # Adiciona o novo módulo após a última linha de módulo
            new_lines = lines[:]
            # Garante que a última linha tem vírgula
            if not new_lines[last_module_line_idx].rstrip().endswith(','):
                new_lines[last_module_line_idx] = new_lines[last_module_line_idx].rstrip() + ','
            # Adiciona o novo módulo
            new_lines.insert(last_module_line_idx + 1, f"    {pascal_name}Module,")
            
            new_imports_content = '\n'.join(new_lines)
            content = content.replace(
                match.group(0),
                f"{match.group(1)}{new_imports_content}\n  {match.group(3)}"
            )
            module_added = True
    
    if not module_added:
        print(f"⚠ Não foi possível adicionar {pascal_name}Module no array de imports automaticamente.")
        print(f"   Adicione manualmente: {pascal_name}Module,")
    
    app_module_path.write_text(content)
    print(f"✓ app.module.ts atualizado com {pascal_name}Module")

def main():
    """Função principal"""
    print("=" * 50)
    print("Criador de Módulos NestJS")
    print("=" * 50)
    print()
    
    # Solicita o nome do módulo
    module_name = input("Digite o nome do módulo: ").strip()
    
    if not module_name:
        print("❌ Nome do módulo não pode ser vazio!")
        return
    
    # Define o caminho base
    script_dir = Path(__file__).parent
    modules_dir = script_dir / "src" / "modules"
    app_module_path = script_dir / "src" / "app.module.ts"
    
    if not modules_dir.exists():
        print(f"❌ Diretório {modules_dir} não encontrado!")
        return
    
    # Cria os arquivos do módulo
    try:
        pascal_name, kebab_name = create_module_files(module_name, modules_dir)
        
        # Atualiza o app.module.ts
        update_app_module(app_module_path, pascal_name, kebab_name)
        
        print()
        print("=" * 50)
        print(f"✅ Módulo '{pascal_name}' criado com sucesso!")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Erro ao criar módulo: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

