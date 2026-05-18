import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { uploadCurriculo } from '../minioService';
import { Upload, CheckCircle2, AlertCircle, Loader2, Briefcase, MapPin, Mail, Phone, HeartPulse } from 'lucide-react';
import { ConfigItem } from '../types';
import { parseJobLandingFromRequisitos } from '../jobsService';

const PublicForm: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    vaga_interesse: '',
    resumo: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // You can still load dynamic cities/roles if they exist, else allow typing or predefined lists.
  // We'll keep them as simple inputs or predefined to avoid blocking the UI if tables aren't seeded.
  const [cidades, setCidades] = useState<ConfigItem[]>([]);
  const [cargos, setCargos] = useState<ConfigItem[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const { data: cData } = await supabase.from('cidades').select('*').order('nome');
        const { data: jData } = await supabase.from('cargos').select('*').order('nome');
        if (cData) setCidades(cData);
        if (jData) {
          setCargos(jData);
          if (slug) {
            const matched = (jData as ConfigItem[])
              .map(c => ({ c, landing: parseJobLandingFromRequisitos(c) }))
              .find(item => item.landing.slug === slug);
            if (matched) {
              setFormData(prev => ({ ...prev, vaga_interesse: matched.c.nome }));
            }
          }
        }
      } catch(e) {
        // Ignora erro se tabelas não existirem
      }
    };
    loadOptions();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!file) throw new Error("O upload do currículo é obrigatório.");

      // Passo 1: Upload para o MinIO
      setUploadStep('Enviando arquivo para o servidor seguro...');
      const fileUrl = await uploadCurriculo(file);

      // Passo 2: Registro no Supabase
      setUploadStep('Finalizando cadastro...');
      const { error: insertError } = await supabase
        .from('candidatos')
        .insert([{
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cidade: formData.cidade,
          vaga_interesse: formData.vaga_interesse,
          resumo: formData.resumo,
          curriculo_url: fileUrl,
        }]);

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Erro ao processar currículo. Tente novamente.");
    } finally {
      setLoading(false);
      setUploadStep('');
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
          <div className="w-24 h-24 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-12 w-12 text-teal-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tighter">Cadastro Realizado!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Seu currículo foi armazenado com sucesso em nosso banco de talentos seguro. 
            A equipe da <span className="font-bold text-teal-600">Gigante Produtos Médicos</span> analisará seu perfil.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            Enviar outro currículo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <span className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block border border-teal-200 dark:border-teal-800">
          Carreiras
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter leading-none">
          CUIDANDO DE VIDAS COM <span className="text-teal-600">EXCELÊNCIA</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-lg mx-auto leading-tight font-medium">
          Envie seus dados para nossa central e faça parte da equipe Gigante Produtos Médicos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 space-y-8 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4">
             <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
                <HeartPulse className="h-5 w-5 text-teal-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
             </div>
             <p className="font-bold uppercase text-teal-600 animate-pulse text-sm">{uploadStep}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-red-800 dark:text-red-300 text-sm font-bold uppercase">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Nome Completo *</label>
            <input 
              required
              type="text"
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 transition-all outline-none font-medium text-gray-800 dark:text-white"
              placeholder="Digite seu nome"
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">E-mail *</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                required
                type="email"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 transition-all outline-none font-medium text-gray-800 dark:text-white"
                placeholder="seu.email@exemplo.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Telefone/WhatsApp *</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                required
                type="tel"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 transition-all outline-none font-medium text-gray-800 dark:text-white"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={e => setFormData({...formData, telefone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Cidade de Atuação *</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                required
                type="text"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 transition-all outline-none font-medium text-gray-800 dark:text-white"
                placeholder="Qual sua cidade?"
                value={formData.cidade}
                onChange={e => setFormData({...formData, cidade: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Vaga de Interesse *</label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              required
              type="text"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 transition-all outline-none font-medium text-gray-800 dark:text-white"
              placeholder="Qual vaga você busca?"
              value={formData.vaga_interesse}
              onChange={e => setFormData({...formData, vaga_interesse: e.target.value})}
              readOnly={!!slug}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Resumo / Apresentação (Opcional)</label>
          <textarea 
            rows={4}
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 transition-all outline-none font-medium text-gray-800 dark:text-white resize-none"
            placeholder="Fale um pouco sobre sua experiência e porque deseja trabalhar conosco..."
            value={formData.resumo}
            onChange={e => setFormData({...formData, resumo: e.target.value})}
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Currículo (PDF/Word) *</label>
          <div className="mt-1 flex justify-center px-6 pt-12 pb-12 border-2 border-gray-200 dark:border-gray-800 border-dashed rounded-3xl hover:border-teal-600 dark:hover:border-teal-500 transition-all cursor-pointer group relative bg-gray-50/50 dark:bg-gray-800/30">
            <input 
              required
              type="file" 
              accept=".pdf,.doc,.docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            <div className="space-y-2 text-center">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mx-auto w-fit transition-transform group-hover:scale-110">
                <Upload className="h-8 w-8 text-teal-600" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold text-teal-600">
                  {file ? file.name : "Selecione ou arraste seu arquivo aqui"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-5 rounded-2xl font-bold text-xl uppercase shadow-xl hover:shadow-teal-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <>Enviar Currículo</>
          )}
        </button>
      </form>
    </div>
  );
};

export default PublicForm;
