
import React, { useState } from 'react';
import { ConstructDefinition } from '../types';
import { analyzeDefinition } from '../services/gemini';
import { Lightbulb, ArrowRight, Loader2, Sparkles, BookOpen, Microscope } from 'lucide-react';

interface Props {
  data: ConstructDefinition;
  onUpdate: (data: ConstructDefinition) => void;
  onNext: () => void;
}

const StepDefinition: React.FC<Props> = ({ data, onUpdate, onNext }) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!data.description || data.description.length < 10) return;
    setLoading(true);
    const result = await analyzeDefinition(data.description);
    setFeedback(result);
    setLoading(false);
  };

  const handleSuggest = () => {
    const examples = [
      {
        name: "Wypalenie (burnout)",
        description: "Stan fizycznego, emocjonalnego i psychicznego wyczerpania spowodowany długotrwałym stresem w miejscu pracy. Objawia się cynizmem, poczuciem braku skuteczności i dystansowaniem się od obowiązków."
      },
      {
        name: "Lęk społeczny",
        description: "Uporczywy strach przed sytuacjami społecznymi, w których jednostka jest wystawiona na ocenę innych. Obejmuje obawę przed byciem skrytykowanym, ośmieszonym lub odrzuconym."
      },
      {
        name: "Inteligencja emocjonalna",
        description: "Zdolność do rozpoznawania, rozumienia i zarządzania własnymi emocjami oraz emocjami innych ludzi. Obejmuje empatię, samoregulację i umiejętności społeczne."
      },
      {
        name: "Prokrastynacja",
        description: "Tendencja do irracjonalnego odkładania zadań związanych z nauką na później, mimo świadomości negatywnych konsekwencji. Często powiązana z lękiem przed porażką i perfekcjonizmem."
      },
      {
        name: "Satysfakcja z życia",
        description: "Globalna ocena jakości własnego życia dokonywana przez jednostkę na podstawie jej własnych kryteriów. Jest to poznawczy aspekt dobrostanu subiektywnego."
      },
      {
        name: "Ekstrawersja (wielka piątka)",
        description: "Tendencja do kierowania uwagi na zewnątrz, poszukiwania stymulacji i towarzystwa innych ludzi. Osoby o wysokim nasileniu są energiczne, towarzyskie i asertywne."
      },
      {
        name: "Neurotyczność (wielka piątka)",
        description: "Skłonność do doświadczania negatywnych emocji, takich jak lęk, gniew, smutek czy poczucie winy. Wiąże się z niską odpornością na stres i labilnością emocjonalną."
      },
      {
        name: "Sumienność (wielka piątka)",
        description: "Cecha opisująca stopień zorganizowania, wytrwałości i motywacji w dążeniu do celu. Osoby sumienne są obowiązkowe, dokładne i zdyscyplinowane."
      },
      {
        name: "Ugodowość (wielka piątka)",
        description: "Nastawienie prospołeczne, cechujące się altruizmem, zaufaniem do innych i skłonnością do współpracy. Osoby ugodowe są życzliwe i unikają konfliktów."
      },
      {
        name: "Otwartość na doświadczenie (wielka piątka)",
        description: "Ciekawość intelektualna, kreatywność i wrażliwość estetyczna. Osoby otwarte poszukują nowych doznań, są tolerancyjne i mają bogatą wyobraźnię."
      },
      {
        name: "Lęk Testowy (Egzaminacyjny)",
        description: "Sytuacyjny lęk odczuwany przed lub w trakcie sytuacji oceniania (np. egzaminów), objawiający się reakcjami fizjologicznymi, chaosem myślowym i chęcią ucieczki."
      },
      {
        name: "Makiawelizm (ciemna triada)",
        description: "Cechuje się cynicznym podejściem do moralności, koncentracją na własnym interesie i skłonnością do manipulowania innymi w celu osiągnięcia osobistych korzyści."
      },
      {
        name: "Narcyzm (ciemna triada)",
        description: "Poczucie wyższości, roszczeniowość, potrzeba bycia podziwianym i brak empatii. Osoby narcystyczne często przeceniają swoje kompetencje."
      },
      {
        name: "Psychopatia (ciemna triada)",
        description: "Deficyt lęku i empatii, impulsywność, poszukiwanie mocnych wrażeń oraz zachowania antyspołeczne. Chłód emocjonalny."
      },
      {
        name: "Poczucie Własnej Skuteczności (self-efficacy)",
        description: "Przekonanie jednostki o jej zdolności do zmobilizowania motywacji, zasobów poznawczych i działań niezbędnych do sprostania wymogom sytuacji."
      },
      {
        name: "Materializm",
        description: "System wartości, w którym posiadanie dóbr materialnych i bogactwa jest centralnym celem życiowym, często kosztem relacji społecznych czy rozwoju duchowego."
      },
      {
        name: "Perfekcjonizm",
        description: "Dążenie do nieosiągalnych standardów przy jednoczesnym krytycznym ocenianiu własnych działań. Może być adaptacyjny (chęć rozwoju) lub nieadaptacyjny (lęk przed błędem)."
      },
      {
        name: "Poczucie Umiejscowienia Kontroli (Locus of Control)",
        description: "Przekonanie o tym, czy wyniki naszych działań zależą od nas samych (wewnętrzne LOC), czy od czynników zewnętrznych, takich jak los czy inni ludzie (zewnętrzne LOC)."
      },
      {
        name: "Potrzeba Aprobaty Społecznej",
        description: "Silne pragnienie bycia akceptowanym przez innych, prowadzące do konformizmu i unikania zachowań, które mogłyby spotkać się z dezaprobatą."
      },
      {
        name: "Agresywność",
        description: "Tendencja do zachowań mających na celu wyrządzenie szkody innym osobom lub przedmiotom. Może być fizyczna, werbalna, bierna lub pośrednia."
      },
      {
        name: "Prężność psychiczna (resilience)",
        description: "Zdolność do skutecznego radzenia sobie z przeciwnościami losu, traumą i silnym stresem, oraz powrotu do równowagi psychicznej."
      },
      {
        name: "Pracoholizm",
        description: "Wewnętrzny przymus pracy, nieustanne myślenie o obowiązkach zawodowych i praca ponad wymagania, często kosztem zdrowia i relacji społecznych."
      },
      {
        name: "Zaufanie organizacyjne",
        description: "Pozytywne oczekiwania pracownika wobec intencji i zachowań pracodawcy oraz współpracowników, wiążące się z poczuciem bezpieczeństwa."
      },
      {
        name: "Lęk przed porażką (atychifobia)",
        description: "Irracjonalny i uporczywy lęk przed niepowodzeniem, który paraliżuje działanie i powstrzymuje przed podejmowaniem wyzwań."
      },
      {
        name: "Wdzięczność",
        description: "Stała tendencja do dostrzegania i doceniania pozytywnych aspektów życia oraz dobra otrzymywanego od innych ludzi."
      },
      {
        name: "Bycie jak Baśka",
        description: "tendencja do ... i ... aspektów oraz ... do ..., a także ..., czy ...."
      }
    ];

    const random = examples[Math.floor(Math.random() * examples.length)];
    onUpdate(random);
    setFeedback(null);
  };

  return (
    <div className="fade-in space-y-6">
      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
            <h2 className="text-2xl font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <Microscope className="text-indigo-600"/> Krok 1: Definicja konstruktu
            </h2>
            <p className="text-indigo-700 max-w-2xl">
              Fundamentem każdego testu jest teoria. Zanim zadasz pierwsze pytanie, musisz precyzyjnie określić, co chcesz zmierzyć. Konstrukt latentny (ukryty) to cecha, której nie widać gołym okiem (np. inteligencja, lęk), ale można ją wnioskować z zachowania.
            </p>
        </div>
        <div className="absolute right-0 top-0 opacity-5 text-indigo-900 transform translate-x-10 -translate-y-4">
            <BookOpen size={160} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Nazwa konstruktu</label>
              <button
                onClick={handleSuggest}
                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 hover:bg-indigo-100"
                title="Wypełnij losowym przykładem"
              >
                <Sparkles size={12} /> Zaproponuj ({25} opcji)
              </button>
            </div>
            <input
              type="text"
              value={data.name}
              onChange={(e) => onUpdate({ ...data, name: e.target.value })}
              placeholder="np. Odporność psychiczna"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Definicja operacyjna</label>
            <textarea
              value={data.description}
              onChange={(e) => onUpdate({ ...data, description: e.target.value })}
              placeholder="Opisz, jak ten konstrukt objawia się w konkretnym zachowaniu. Np. 'Osoba odporna psychicznie w sytuacji stresu reaguje...'"
              rows={5}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
             <strong className="flex items-center gap-1 text-slate-800"><BookOpen size={14}/> Teoria w pigułce: Operacjonalizacja</strong>
             <p>
               To proces tłumaczenia abstrakcyjnych pojęć na mierzalne wskaźniki. Nie możesz zmierzyć "gniewu" bezpośrednio termometrem. Musisz go zoperacjonalizować jako: "zaciskanie pięści", "podniesiony głos", "przyspieszone tętno". Twoja definicja powyżej to instrukcja dla generowania pytań.
             </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !data.description}
            className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Lightbulb size={16} />}
            Poproś o ocenę definicji (Eksperta)
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          {feedback ? (
            <div className="bg-green-50 p-4 rounded-lg border border-green-100 animate-fade-in">
              <h4 className="font-semibold text-green-800 mb-1 flex items-center gap-2"><Lightbulb size={16}/> Informacja zwrotna Eksperta:</h4>
              <p className="text-green-700 text-sm leading-relaxed">{feedback}</p>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <Lightbulb size={24} />
              </div>
              <p>Wypełnij definicję operacyjną i poproś o analizę. <br/>Dobra definicja to klucz do dobrych pytań.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!data.name || !data.description}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Dalej: "generowanie pytań" <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default StepDefinition;
