export type Cargo = string;

export interface Candidato {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  vaga_interesse: string;
  resumo?: string;
  curriculo_url: string; // URL do MinIO
  created_at: string;
}

export interface ConfigItem {
  id: string;
  nome: string;
  created_at: string;
}

export interface KPIStats {
  total: number;
  porCidade: Record<string, number>;
  porCargo: Record<string, number>;
  porDia: Record<string, number>;
}

export interface AccessLog {
  id: string;
  user_id: string;
  user_email: string;
  candidato_id: string;
  action: 'view' | 'download';
  timestamp: string;
}

export type TipoPergunta = 'texto_curto' | 'texto_longo' | 'multipla_escolha' | 'nota';

export interface Pergunta {
  id: string;
  tipo: TipoPergunta;
  enunciado: string;
  opcoes?: string[]; // Usado apenas para múltipla escolha
  obrigatoria: boolean;
}

export interface Pesquisa {
  id: string;
  titulo: string;
  descricao: string;
  slug?: string;
  perguntas: Pergunta[];
  is_active: boolean;
  created_at: string;
}
