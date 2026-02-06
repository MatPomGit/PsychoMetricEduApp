
import React, { useState } from 'react';
import { ConstructDefinition, TestItem } from '../types';
import { generatePsychometricItems } from '../services/gemini';
import { Plus, Sparkles, Trash2, ArrowRight, AlertCircle, Gavel, CheckCircle, Edit2, Check, X, Info, Scale, BookOpen } from 'lucide-react';

interface Props {
  construct: ConstructDefinition;
  items: TestItem[];
  setItems: (items: TestItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepItems: React.FC<Props> = ({ construct, items, setItems, onNext, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [judgesRating, setJudgesRating] = useState<{wKendall: number, comment: string} | null>(null);
  
  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setJudgesRating(null); // Reset validation on new generation
    const newItemsData = await generatePsychometricItems(
      construct.name,
      construct.description,
      items.map(i => i.text)
    );

    const newItems: TestItem[] = newItemsData.map((item, idx) => ({
      id: Date.now().toString() + idx,
      text: item.text,
      type: item.type,
      qualityScore: 0.6 + Math.random() * 0.4
    }));

    setItems([...items, ...newItems]);
    setLoading(false);
  };

  const handleValidate = () => {
    // Simulate Expert Judges (Content Validity)
    // PDF Point 5: Trafność treściowa / Sędziowie kompetentni
    setLoading(true);
    setTimeout(() => {
      const w = 0.65 + (Math.random() * 0.3); // Simulate W-Kendall (0-1)
      setJudgesRating({
        wKendall: parseFloat(w.toFixed(2)),
        comment: w > 0.8 
          ? "Wysoka zgodność sędziów (W > 0.8). Sędziowie są zgodni, że pytania dobrze reprezentują konstrukt." 
          : "Umiarkowana zgodność sędziów. Część pytań może być niejasna lub wieloznaczna. Warto je doprecyzować."
      });
      setLoading(false);
    }, 1200);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    setJudgesRating(null);
  };

  const startEditing = (item: TestItem) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const saveEditing = () => {
    if (!editingId || !editText.trim()) return;
    const updatedItems = items.map(i => 
      i.id === editingId ? { ...i, text: editText.trim() } : i
    );
    setItems(updatedItems);
    setEditingId(null);
    setJudgesRating(null); // Invalidate judges because content changed
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex-1">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Krok 2: Pula Pozycji i Trafność Treściowa</h2>
          <p className="text-blue-700">
            Teraz zamieniamy definicję na konkretne stwierdzenia (pozycje testowe). Musimy zadbać o różnorodność pytań i wyeliminować błędy językowe.
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:w-64 w-full">
             <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Badany Konstrukt</h4>
             <p className="font-semibold text-slate-800">{construct.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            Lista Pozycji ({items.length})
            {items.length > 0 && (
                <span className="text-xs font-normal text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 hidden md:inline-block">
                  Zalecane min. 5-10 pytań do symulacji
                </span>
            )}
          </h3>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-70 shadow-md hover:shadow-lg"
          >
            {loading && !judgesRating ? <Sparkles className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Generuj z AI
          </button>
        </div>
        
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="mb-2">Twoja ankieta jest pusta.</p>
            <p>Kliknij "Generuj z AI", aby stworzyć pytania na podstawie definicji.</p>
          </div>
        ) : (
          <ul className="p-4 space-y-3 bg-slate-50/50">
            {items.map((item) => (
              <li 
                key={item.id} 
                className={`group p-4 bg-white rounded-xl border shadow-sm transition-all duration-300 ease-out flex items-center justify-between
                  ${editingId === item.id ? 'border-indigo-400 ring-2 ring-indigo-50 scale-[1.01]' : 'border-slate-200 hover:shadow-md hover:border-indigo-300 hover:scale-[1.02]'}
                `}
              >
                {editingId === item.id ? (
                  <div className="flex items-center w-full gap-2">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm opacity-50 ${
                        item.type === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.type === 'positive' ? 'Wprost' : 'Odwrócone'}
                      </span>
                     <input 
                       type="text" 
                       value={editText}
                       onChange={(e) => setEditText(e.target.value)}
                       placeholder="Treść pytania..."
                       className="flex-1 p-2 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                       autoFocus
                       onKeyDown={(e) => { if(e.key === 'Enter') saveEditing(); else if(e.key === 'Escape') cancelEditing(); }}
                     />
                     <div className="flex items-center gap-1">
                       <button onClick={saveEditing} className="p-2 text-green-600 bg-green-50 rounded hover:bg-green-100"><Check size={16}/></button>
                       <button onClick={cancelEditing} className="p-2 text-slate-400 bg-slate-50 rounded hover:bg-slate-100"><X size={16}/></button>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3 items-start flex-1 pr-4">
                      <span 
                        title={item.type === 'negative' ? "Pytanie odwrócone zapobiega automatycznemu zaznaczaniu 'Zgadzam się' (akwiescencja)." : "Pytanie sformułowane wprost."}
                        className={`cursor-help mt-0.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm flex-shrink-0 ${
                        item.type === 'positive' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {item.type === 'positive' ? 'Wprost' : 'Odwrócone'}
                      </span>
                      <p className="text-slate-700 font-medium leading-relaxed group-hover:text-indigo-900 transition-colors cursor-default">
                        {item.text}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEditing(item)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50"
                        title="Edytuj treść"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Usuń pozycję"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        
        {/* Educational Note about Reverse Scoring */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2 text-xs text-slate-600">
                <Info size={16} className="shrink-0 text-indigo-500" />
                <div>
                    <strong>Akwiescencja (Tendencja do potakiwania)</strong>
                    <p className="mt-1">
                      Ludzie mają tendencję do zgadzania się z pytaniami, gdy czytają je bez skupienia. Pytania odwrócone (np. "Nie lubię...") zmuszają do uwagi. Jeśli ktoś zaznaczy "Zgadzam się" przy "Lubię X" i "Zgadzam się" przy "Nie lubię X" - wiemy, że wyniki są nierzetelne.
                    </p>
                </div>
            </div>
            <div className="flex-1 flex gap-2 text-xs text-slate-600">
                <BookOpen size={16} className="shrink-0 text-indigo-500" />
                <div>
                     <strong>Teoria w Pigułce: Pula Pozycji</strong>
                     <p className="mt-1">
                       Zawsze generuj 2x więcej pytań niż potrzebujesz. W toku analizy (Krok 4) odrzucisz te o słabej mocy różnicującej. To tzw. "czyszczenie narzędzia".
                     </p>
                </div>
            </div>
        </div>
      </div>

      {/* Validation Section */}
      {items.length >= 3 && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <Gavel size={18} className="text-slate-600" /> Trafność Treściowa (Content Validity)
                </h4>
                <p className="text-sm text-slate-600 mt-1 max-w-xl">
                  Zanim zbadamy ludzi, musimy zapytać ekspertów: "Czy te pytania rzeczywiście mierzą to, co zdefiniowaliśmy?".
                </p>
             </div>
             
             {judgesRating ? (
               <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                 <div className="text-right">
                   <div className="text-2xl font-bold text-indigo-900">{judgesRating.wKendall}</div>
                   <div className="text-[10px] font-bold uppercase text-slate-500">Wskaźnik W-Kendalla</div>
                 </div>
                 <div className="h-8 w-px bg-slate-200"></div>
                 <CheckCircle className="text-green-500" size={24} />
               </div>
             ) : (
                <button
                  onClick={handleValidate}
                  disabled={loading || !!editingId}
                  className="px-5 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition disabled:opacity-50 shadow-md"
                >
                  {loading ? "Ocenianie..." : "Symuluj ocenę Sędziów"}
                </button>
             )}
          </div>

          {judgesRating && (
            <div className="flex items-start gap-3 text-slate-700 text-sm bg-white p-4 rounded-lg border border-l-4 border-l-green-500 border-slate-200 animate-slide-up shadow-sm">
               <Scale size={18} className="mt-0.5 text-green-600 shrink-0" />
               <div>
                  <strong>Werdykt sędziów:</strong> {judgesRating.comment}
                  <p className="text-xs text-slate-400 mt-1">
                     W realnym badaniu pyta się sędziów o każde pytanie z osobna (np. na skali "istotne - nieistotne"), a następnie liczy współczynnik CVR (Content Validity Ratio). Sędziowie eliminują pytania niejasne lub wykraczające poza definicję konstruktu.
                  </p>
               </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4">
         <button
          onClick={onBack}
          className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition"
        >
          Wróć
        </button>
        <button
          onClick={onNext}
          disabled={items.length < 3 || !!editingId}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-200"
        >
          Dalej: Symulacja badania <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default StepItems;
