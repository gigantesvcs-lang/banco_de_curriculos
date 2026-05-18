import { ConfigItem, JobLandingContent } from './types';
import heroVagasDefault from './imagens/banner_hero_vagas.png';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const createDefaultJobLanding = (jobName: string): JobLandingContent => ({
  published: false,
  slug: slugify(jobName || 'nova-vaga'),
  title: jobName || 'Nova Vaga',
  heroImageUrl: heroVagasDefault,
  location: 'A combinar',
  workModel: 'Presencial',
  shortDescription: 'Descreva em 2 ou 3 linhas o impacto desta vaga para o time.',
  salary: 'A combinar',
  benefits: ['Vale alimentacao', 'Plano de saude'],
  responsibilities: ['Descreva as responsabilidades principais da funcao'],
  requirements: ['Descreva os requisitos obrigatorios da funcao'],
  agentContext: ''
});

export const parseJobLandingFromRequisitos = (cargo: ConfigItem): JobLandingContent => {
  const rawValue = cargo.requisitos as any;
  const raw = typeof rawValue === 'string' ? rawValue.trim() : (rawValue ? JSON.stringify(rawValue) : '');
  if (!raw) {
    return createDefaultJobLanding(cargo.nome);
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      ...createDefaultJobLanding(cargo.nome),
      ...parsed,
      title: parsed?.title || cargo.nome,
      slug: parsed?.slug || slugify(cargo.nome),
      benefits: Array.isArray(parsed?.benefits) ? parsed.benefits : createDefaultJobLanding(cargo.nome).benefits,
      responsibilities: Array.isArray(parsed?.responsibilities) ? parsed.responsibilities : createDefaultJobLanding(cargo.nome).responsibilities,
      requirements: Array.isArray(parsed?.requirements) ? parsed.requirements : createDefaultJobLanding(cargo.nome).requirements
    };
  } catch {
    return {
      ...createDefaultJobLanding(cargo.nome),
      requirements: [raw],
      agentContext: raw
    };
  }
};

export const serializeJobLanding = (landing: JobLandingContent) => JSON.stringify(landing);

export const toLines = (value: string) =>
  value
    .split('\n')
    .map(v => v.trim())
    .filter(Boolean);
