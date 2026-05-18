import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ConfigItem } from '../types';
import { parseJobLandingFromRequisitos } from '../jobsService';
import { MapPin, Briefcase, ArrowRight, Loader2 } from 'lucide-react';

const PublicJobsBoard: React.FC = () => {
  const [jobs, setJobs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('cargos').select('*').order('created_at', { ascending: false });
        setJobs(data || []);
      } catch (error) {
        console.error('Erro ao carregar vagas:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeJobs = jobs
    .map(cargo => ({ cargo, landing: parseJobLandingFromRequisitos(cargo) }))
    .filter(item => item.landing.published);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <div className="rounded-[2.5rem] bg-gradient-to-r from-teal-700 via-cyan-700 to-slate-800 p-8 md:p-12 text-white shadow-2xl mb-10">
        <p className="text-xs uppercase tracking-[0.2em] font-black text-teal-100">Carreiras Gigante</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mt-2">Vagas Abertas</h1>
        <p className="text-teal-50 mt-4 max-w-2xl font-medium">Explore oportunidades e encontre uma vaga alinhada ao seu momento profissional.</p>
      </div>

      {activeJobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-10 text-center text-gray-500 dark:text-gray-400 font-semibold">
          Nenhuma vaga publicada no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeJobs.map(({ cargo, landing }) => (
            <article key={cargo.id} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-7 shadow-lg">
              <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">{landing.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-3 min-h-[48px]">{landing.shortDescription}</p>
              <div className="flex flex-wrap gap-2 mt-4 text-[11px] font-black uppercase">
                <span className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{landing.location}</span>
                <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />{landing.workModel}</span>
              </div>
              <Link to={`/vagas/${landing.slug}`} className="mt-6 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-black uppercase text-xs transition-all">
                Saiba mais <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicJobsBoard;
