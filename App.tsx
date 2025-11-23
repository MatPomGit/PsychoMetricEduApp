import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StepDefinition from './components/StepDefinition';
import StepItems from './components/StepItems';
import StepSimulation from './components/StepSimulation';
import StepAnalysis from './components/StepAnalysis';
import StepNorms from './components/StepNorms';
import TutorialOverlay from './components/TutorialOverlay';
import { AppStep, ConstructDefinition, TestItem, SimulationResult } from './types';
import { Check, ChevronRight, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.DEFINITION);
  const [showTutorial, setShowTutorial] = useState(true);
  
  // State for Step 1
  const [construct, setConstruct] = useState<ConstructDefinition>({
    name: '',
    description: ''
  });

  // State for Step 2
  const [items, setItems] = useState<TestItem[]>([]);

  // State for Step 3 & 4
  const [results, setResults] = useState<SimulationResult | null>(null);

  // Show tutorial whenever step changes
  useEffect(() => {
    setShowTutorial(true);
  }, [currentStep]);

  const resetApp = () => {
    setCurrentStep(AppStep.DEFINITION);
    setConstruct({ name: '', description: '' });
    setItems([]);
    setResults(null);
  };

  // Render Progress Bar
  const steps = [
    { id: AppStep.DEFINITION, label: "Koncept" },
    { id: AppStep.ITEM_GENERATION, label: "Pozycje" },
    { id: AppStep.DATA_SIMULATION, label: "Symulacja" },
    { id: AppStep.ANALYSIS, label: "KTT" },
    { id: AppStep.NORMS, label: "Normy" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      {showTutorial && (
        <TutorialOverlay 
          step={currentStep} 
          onClose={() => setShowTutorial(false)} 
        />
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 relative">
        
        {/* Help Button */}
        <button 
          onClick={() => setShowTutorial(true)}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-white text-indigo-600 p-3 rounded-full shadow-lg border border-indigo-100 hover:scale-110 transition-transform z-40"
          title="Pokaż samouczek"
        >
          <HelpCircle size={24} />
        </button>

        {/* Progress Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 -z-10" />
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer
                      ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                        isCurrent ? 'bg-white border-indigo-600 text-indigo-600 shadow-lg scale-110 ring-4 ring-indigo-50' : 
                        'bg-white border-slate-300 text-slate-300'}
                    `}
                  >
                    {isCompleted ? <Check size={20} /> : <span className="font-bold">{idx + 1}</span>}
                  </div>
                  <span className={`text-[10px] md:text-xs font-semibold mt-2 uppercase tracking-wider transition-colors ${isCurrent ? 'text-indigo-700' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="bg-white rounded-2xl p-2 md:p-4 shadow-none md:bg-transparent transition-all duration-500">
          {currentStep === AppStep.DEFINITION && (
            <StepDefinition 
              data={construct}
              onUpdate={setConstruct}
              onNext={() => setCurrentStep(AppStep.ITEM_GENERATION)}
            />
          )}

          {currentStep === AppStep.ITEM_GENERATION && (
            <StepItems 
              construct={construct}
              items={items}
              setItems={setItems}
              onBack={() => setCurrentStep(AppStep.DEFINITION)}
              onNext={() => setCurrentStep(AppStep.DATA_SIMULATION)}
            />
          )}

          {currentStep === AppStep.DATA_SIMULATION && (
            <StepSimulation 
              items={items}
              onAnalysisComplete={(res, updatedItems) => {
                setResults(res);
                setItems(updatedItems);
              }}
              onNext={() => setCurrentStep(AppStep.ANALYSIS)}
              onBack={() => setCurrentStep(AppStep.ITEM_GENERATION)}
            />
          )}

          {currentStep === AppStep.ANALYSIS && (
             <StepAnalysis 
               results={results}
               items={items}
               onItemsUpdate={setItems}
               onReset={resetApp}
               onNext={() => setCurrentStep(AppStep.NORMS)}
             />
          )}

          {currentStep === AppStep.NORMS && results && (
            <StepNorms 
              results={results}
              onReset={resetApp}
            />
          )}
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-400 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} PsychoMetric. Narzędzie edukacyjne.</p>
          <p className="text-xs mt-1 opacity-60">2025. v1.1. MatPom</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
