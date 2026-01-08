export type CanalContato = 'WHATSAPP' | 'TELEGRAM' | 'INSTAGRAM' | 'MESSENGER' | 'EMAIL' | 'IA' | 'OUTROS';

/**
 * Representa um canal de contato
 */
export type ContatoCanal = {
  id: string;
  canal_contato: CanalContato;
  contato: string; // Identificador único no canal (número, email, username)
  foto_perfil_url?: string;
  pushname?: string;
  created_at?: Date;
  updated_at?: Date;
};

/**
 * Representa um contato com múltiplos canais
 */
export type Contato = {
  id: string;
  tenant_id?: string;
  nome: string;
  cidade?: string;
  setor_id?: string;
  created_by?: string;
  variaveis?: Record<string, any>;
  canais: ContatoCanal[];
  created_at?: Date;
  updated_at?: Date;
  // Informações do setor associado
  setor?: {
    id: string;
    nome: string;
  };
};

export type ContactResponseByIds = {
  contatos: Contato[];
  idsNaoEncontrados: string[];
};

/**
 * Helper para obter o canal WhatsApp de um contato
 */
export function getWhatsAppCanal(contato: Contato): ContatoCanal | undefined {
  return contato.canais?.find(c => c.canal_contato === 'WHATSAPP');
}

/**
 * Helper para obter o identificador WhatsApp (número) de um contato
 */
export function getWhatsAppId(contato: Contato): string | undefined {
  const canal = getWhatsAppCanal(contato);
  return canal?.contato;
}

/**
 * Helper para obter o canal principal de um contato (primeiro canal ou por tipo)
 */
export function getCanalPrincipal(contato: Contato, tipoCanal?: CanalContato): ContatoCanal | undefined {
  if (!contato.canais || contato.canais.length === 0) {
    return undefined;
  }
  
  if (tipoCanal) {
    return contato.canais.find(c => c.canal_contato === tipoCanal);
  }
  
  return contato.canais[0];
}

/**
 * Helper para verificar se contato tem um canal específico
 */
export function hasCanal(contato: Contato, tipoCanal: CanalContato): boolean {
  return contato.canais?.some(c => c.canal_contato === tipoCanal) || false;
}

/**
 * Helper para obter o identificador de um contato em um canal específico
 */
export function getIdentificadorCanal(contato: Contato, tipoCanal: CanalContato): string | undefined {
  const canal = contato.canais?.find(c => c.canal_contato === tipoCanal);
  return canal?.contato;
}

/**
 * Helper para obter um canal específico pelo ID do ContatoCanal
 */
export function getCanalById(contato: Contato, contatoCanalId: string): ContatoCanal | undefined {
  if (!contato.canais || contato.canais.length === 0) {
    return undefined;
  }
  
  return contato.canais.find(c => c.id === contatoCanalId);
}
