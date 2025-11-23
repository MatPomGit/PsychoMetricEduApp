
import React from 'react';
import { X, Zap, Brain, BarChart3, BookOpen, ChevronRight, Scale, Gavel, Lightbulb, Target, Stethoscope } from 'lucide-react';

interface Props {
  step: number;
  onClose: () => void;
}

const TutorialOverlay: React.FC<Props> = ({ step, onClose }) => {
  const content = [
    {
      // Definition
      title: "1. Definicja Konstruktu",
      text: "Psychometria zaczyna się od teorii. Musisz zdefiniować 'co mierzymy'. Dobra definicja operacyjna pozwala przejść od abstrakcji (np. 'lęk') do konkretnych zachowań.",
      proTip: "Unikaj definicji kołowych (tautologii). Nie definiuj lęku jako 'odczuwanie lęku', ale wskaż konkretne objawy: przyspieszone bicie serca, gonitwa myśli, unikanie kontaktu wzrokowego.",
      icon: <Brain size={48} className="text-indigo-500" />,
      color: "bg-indigo-50 border-indigo-100"
    },
    {
      // Items
      title: "2. Pula Pozycji i Trafność",
      text: "Generujemy pytania, ale to nie wszystko! Musimy sprawdzić Trafność Treściową. W praktyce robią to Sędziowie Kompetentni (W-Kendalla). Jeśli sędziowie nie są zgodni, pytanie jest do kosza.",
      proTip: "Unikaj pytań wielokrotnie złożonych (np. 'Lubię kawę i herbatę'). Badany może lubić jedno, a nie lubić drugiego. Jedno pytanie = jedna myśl.",
      icon: <Gavel size={48} className="text-amber-500" />,
      color: "bg-amber-50 border-amber-100"
    },
    {
      // Simulation
      title: "3. Symulacja Badania",
      text: "Wirtualni studenci wypełniają Twój test. System zbiera dane zarówno od grupy ogólnej, jak i klinicznej, aby sprawdzić, czy test potrafi je rozróżnić (trafność diagnostyczna).",
      proTip: "Pamiętaj o reprezentatywności próby. Badanie 1000 studentów psychologii nie pozwoli stworzyć norm dla całej populacji Polaków (błąd doboru próby).",
      icon: <BookOpen size={48} className="text-blue-500" />,
      color: "bg-blue-50 border-blue-100"
    },
    {
      // Analysis
      title: "4. Analiza i Diagnoza Kliniczna",
      text: "To serce procesu. Sprawdzamy nie tylko rzetelność (Alfa), ale przede wszystkim trafność kliniczną. Używamy testu U Manna-Whitneya, by potwierdzić, czy osoby z zaburzeniem mają istotnie wyższe wyniki niż zdrowi.",
      proTip: "Istotność statystyczna (p < 0.05) to nie wszystko. Liczy się wielkość efektu (d-Cohena). Jeśli efekt jest mały, test nie nadaje się do diagnozy indywidualnej, mimo że 'działa' statystycznie.",
      icon: <Stethoscope size={48} className="text-rose-500" />,
      color: "bg-rose-50 border-rose-100"
    },
    {
      // Norms
      title: "5. Normy i Przedział Ufności",
      text: "Surowy wynik to tylko estymacja. Każdy pomiar obarczony jest błędem (SEM). Dlatego w diagnozie używamy przedziałów ufności (np. 95%), mówiąc: 'prawdziwy wynik leży między X a Y'.",
      proTip: "Normy się starzeją! Z powodu 'efektu Flynna' (wzrost IQ w populacji) testy inteligencji muszą być renomalizowane co kilkanaście lat, by wyniki były aktualne.",
      icon: <Scale size={48} className="text-purple-500" />,
      color: "bg-purple-50 border-purple-100"
    }
  ];

  const current = content[step] || content[0];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-slide-up border border-white/20">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-inner ${current.color} mb-2`}>
            {current.icon}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">{current.title}</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              {current.text}
            </p>
          </div>

          {/* Pro Tip Section */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left w-full rounded-r-lg relative overflow-hidden">
             <div className="absolute -right-4 -top-4 text-yellow-100 transform rotate-12">
               <Lightbulb size={64} />
             </div>
            <div className="relative z-10">
                <p className="text-xs font-bold text-yellow-600 uppercase mb-1 flex items-center gap-1">
                    <Zap size={12} /> Pro Tip Psychometryczny
                </p>
                <p className="text-sm text-yellow-800 italic leading-snug">"{current.proTip}"</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 w-full"
          >
            <span>Rozumiem, działamy!</span>
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
