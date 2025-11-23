
import React, { useEffect, useState, useRef } from 'react';
import { TestItem, SimulationResult } from '../types';
import { ArrowRight, Users, Database, CheckCircle2, Play, History, RefreshCcw, Settings2, Sparkles, Sigma, GraduationCap } from 'lucide-react';

interface Props {
  items: TestItem[];
  onAnalysisComplete: (result: SimulationResult, updatedItems: TestItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

interface SimulationRun {
  id: number;
  n: number;
  correlation: number;
  quality: number;
  alpha: number;
  sem: number;
  ci: number;
}

const StepSimulation: React.FC<Props> = ({ items, onAnalysisComplete, onNext, onBack }) => {
  // Simulation Parameters
  const [targetSample, setTargetSample] = useState(200);
  const [itemCohesion, setItemCohesion] = useState(0.4); // Average inter-item correlation
  const [constructQuality, setConstructQuality] = useState(0.7); // Theoretical Quality of Construct
  
  // State
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  
  // History of runs
  const [history, setHistory] = useState<SimulationRun[]>([]);
  const [lastResult, setLastResult] = useState<SimulationResult | null>(null);

  const progressInterval = useRef<number | null>(null);

  const startSimulation = () => {
    setIsSimulating(true);
    setProgress(0);
    setCurrentCount(0);
  };

  // Simulation Loop
  useEffect(() => {
    if (isSimulating) {
      progressInterval.current = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            finishSimulation();
            return 100;
          }
          const increment = Math.max(1, 1000 / targetSample); // Faster for small N, consistent duration for large N
          const next = prev + 2; 
          setCurrentCount(Math.min(Math.floor((next / 100) * targetSample), targetSample));
          return next;
        });
      }, 30);

      return () => {
        if (progressInterval.current) clearInterval(progressInterval.current);
      };
    }
  }, [isSimulating, targetSample]);

  const finishSimulation = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    setIsSimulating(false);

    // --- MATH ENGINE ---
    
    // 1. Effective Correlation (Slider + Random Noise based on N)
    // Smaller N = More noise/instability in correlation estimates
    const noiseMagnitude = 0.5 / Math.sqrt(targetSample); 
    const randomNoise = (Math.random() - 0.5) * 2 * noiseMagnitude;
    const effectiveCorrelation = Math.max(0.05, Math.min(0.95, itemCohesion + randomNoise));

    // 2. Calculate Cronbach's Alpha (Standardized Formula)
    // Alpha = (K * r_bar) / (1 + (K-1) * r_bar)
    const K = items.length;
    const alphaNumerator = K * effectiveCorrelation;
    const alphaDenominator = 1 + ((K - 1) * effectiveCorrelation);
    const simulatedAlpha = alphaNumerator / alphaDenominator;

    // 2b. Calculate Split-Half Reliability
    // High construct quality usually means more consistent measures, but noise remains
    const splitHalf = Math.min(0.99, Math.max(0.01, simulatedAlpha + ((Math.random() * 0.08) - 0.04)));

    // 3. Simulate SD and Mean
    const maxScore = items.length * 5;
    // Mean shifts slightly with cohesion (better items often yield cleaner distributions)
    const meanScore = maxScore * (0.55 + (Math.random() * 0.1)); 
    const sd = maxScore * 0.15; // Assuming ~15% of range is SD

    // 4. CTT: SEM
    const sem = sd * Math.sqrt(1 - simulatedAlpha);
    
    // 5. CI (95%) = 1.96 * SEM
    const ci = 1.96 * sem;

    // 6. Validity Simulations
    
    // Variance Explained (Factorial Validity)
    const varianceExplained = Math.min(85, Math.max(20, 
      (effectiveCorrelation * 60) + (constructQuality * 25) + (Math.random() * 5)
    ));
    
    // Convergent Validity
    const convergentValidity = Math.min(0.92, Math.max(0.1, 
      (constructQuality * 0.65) + (effectiveCorrelation * 0.25) + (Math.random() * 0.1)
    ));
    
    // Discriminant Validity
    const discriminantValidity = Math.min(0.8, Math.max(0.05, 
      ((1 - constructQuality) * 0.6) + (Math.random() * 0.25)
    ));
    
    // Criterion Validity
    const criterionValidity = Math.min(0.85, Math.max(0.1, 
      (constructQuality * 0.5) + (effectiveCorrelation * 0.3) + (Math.random() * 0.15)
    ));

    // 7. Fit Indices (CFA Simulation)
    const baseFit = (constructQuality * 0.7) + (effectiveCorrelation * 0.3); // 0 to 1
    const cfi = Math.min(0.99, Math.max(0.60, 0.85 + (baseFit * 0.14) + ((Math.random() - 0.5) * 0.02)));
    const rmsea = Math.max(0.01, Math.min(0.20, 0.15 - (baseFit * 0.12) + ((Math.random() - 0.5) * 0.01)));
    const srmr = Math.max(0.01, rmsea * 0.8);

    // 8. Clinical vs Control Group Simulation (Mann-Whitney U preparation)
    // If construct quality is high, the groups should be distinct (high d-Cohen).
    const separationFactor = constructQuality * 2.5; // Higher quality = better separation
    const controlMean = maxScore * 0.4;
    const clinicalMean = maxScore * (0.4 + (separationFactor * 0.15)); // Clinical group scores higher
    const pooledSD = sd * 1.1;
    
    // Calculate Cohen's d
    const effectSize = (clinicalMean - controlMean) / pooledSD;
    
    // Simulate U-test p-value based on effect size and N
    // Higher effect size and higher N = lower p-value
    const zApprox = effectSize * Math.sqrt(targetSample / 2);
    // Simple p-value approximation from Z
    const pValue = Math.exp(-0.717 * zApprox - 0.416 * zApprox * zApprox) || 0.001; 
    const uValue = (targetSample * targetSample) / 4 - (zApprox * Math.sqrt((targetSample * targetSample * (2 * targetSample + 1)) / 12));

    // Generate Distribution Data for Visualization
    const distributionData = [];
    const rangeMin = maxScore * 0.1;
    const rangeMax = maxScore * 0.9;
    const stepSize = maxScore / 50;

    for(let s = rangeMin; s <= rangeMax; s += stepSize) {
       const controlDensity = (1 / (pooledSD * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((s - controlMean) / pooledSD, 2));
       const clinicalDensity = (1 / (pooledSD * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((s - clinicalMean) / pooledSD, 2));
       
       // Calculate mocked frequency (histogram height) based on density + noise
       // Freq = Density * N * BinWidth
       const noiseC = 0.8 + Math.random() * 0.4; // Add jaggedness for realism
       const noiseCl = 0.8 + Math.random() * 0.4;
       
       const controlFreq = Math.round(controlDensity * targetSample * stepSize * 10 * noiseC);
       const clinicalFreq = Math.round(clinicalDensity * targetSample * stepSize * 10 * noiseCl);

       distributionData.push({
         score: Math.round(s),
         controlDensity,
         clinicalDensity,
         controlFreq,
         clinicalFreq
       });
    }

    // 9. Update Items & Calculate TIF (Test Information Function)
    const updatedItems = items.map(item => ({
      ...item,
      difficulty: parseFloat((0.3 + Math.random() * 0.5).toFixed(2)),
      discrimination: parseFloat(Math.min(2.5, Math.max(0.2, 
        (effectiveCorrelation * 2) + ((Math.random() - 0.5) * 0.5)
      )).toFixed(2))
    }));

    // Calculate TIF Points (Theta -3 to 3)
    const testInformationData = [];
    for (let theta = -3; theta <= 3.1; theta += 0.2) {
      let totalInfo = 0;
      updatedItems.forEach(item => {
        const a = item.discrimination || 1;
        const b = -Math.log((item.difficulty || 0.5) / (1 - (item.difficulty || 0.5)));
        const prob = 1 / (1 + Math.exp(-1.7 * a * (theta - b)));
        const info = (a * a) * prob * (1 - prob);
        totalInfo += info;
      });
      testInformationData.push({
        theta: parseFloat(theta.toFixed(1)),
        info: parseFloat(totalInfo.toFixed(2)),
        sem: parseFloat((1 / Math.sqrt(totalInfo)).toFixed(2))
      });
    }

    const newResult: SimulationResult = {
      cronbachAlpha: parseFloat(simulatedAlpha.toFixed(2)),
      splitHalfReliability: parseFloat(splitHalf.toFixed(2)),
      meanScore: meanScore,
      standardDeviation: sd,
      sem: parseFloat(sem.toFixed(2)),
      confidenceInterval: parseFloat(ci.toFixed(2)),
      sampleSize: targetSample,
      itemCorrelations: updatedItems.map(i => ({ itemId: i.id, correlation: i.discrimination || 0 })),
      varianceExplained: parseFloat(varianceExplained.toFixed(1)),
      convergentValidity: parseFloat(convergentValidity.toFixed(2)),
      discriminantValidity: parseFloat(discriminantValidity.toFixed(2)),
      criterionValidity: parseFloat(criterionValidity.toFixed(2)),
      fitIndices: {
        cfi: parseFloat(cfi.toFixed(3)),
        rmsea: parseFloat(rmsea.toFixed(3)),
        srmr: parseFloat(srmr.toFixed(3)),
      },
      groupComparison: {
        controlGroupMean: parseFloat(controlMean.toFixed(1)),
        clinicalGroupMean: parseFloat(clinicalMean.toFixed(1)),
        uValue: Math.round(Math.abs(uValue)),
        pValue: Math.min(1, pValue), // Cap at 1
        effectSize: parseFloat(effectSize.toFixed(2)),
        distribution: distributionData
      },
      testInformation: testInformationData
    };

    setLastResult(newResult);
    
    // Add to history
    setHistory(prev => [{
      id: Date.now(),
      n: targetSample,
      correlation: itemCohesion,
      quality: constructQuality,
      alpha: newResult.cronbachAlpha,
      sem: newResult.sem,
      ci: newResult.confidenceInterval
    }, ...prev]);

    // Pass to parent immediately
    onAnalysisComplete(newResult, updatedItems);
  };

  const getAlphaColor = (alpha: number) => {
    if (alpha >= 0.9) return 'text-emerald-600';
    if (alpha >= 0.7) return 'text-green-600';
    if (alpha >= 0.6) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="fade-in space-y-8 py-6">
      
      {/* Header */}
      <div className="text-center mb-8">
         <h2 className="text-2xl font-bold text-slate-800">Krok 3: Laboratorium Symulacji Badania</h2>
         <p className="text-slate-600 max-w-2xl mx-auto mt-2">
           Tu dzieje się statystyka. "Przebadamy" wirtualnych respondentów, generując macierz odpowiedzi. Zobacz, jak wielkość próby (N) wpływa na stabilność wyników.
         </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Settings2 size={18} className="text-indigo-600" /> Parametry Symulacji
            </h3>

            {/* Slider: Sample Size */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Wielkość Próby (N)</label>
                <span className="text-sm font-bold text-indigo-600">{targetSample} osób</span>
              </div>
              <input
                type="range"
                min="30"
                max="1000"
                step="10"
                value={targetSample}
                onChange={(e) => setTargetSample(Number(e.target.value))}
                disabled={isSimulating}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              
              <div className="bg-blue-50 p-3 rounded mt-3 text-xs text-blue-800 border border-blue-100">
                <strong className="flex items-center gap-1 mb-1"><GraduationCap size={14}/> Akademia: Prawo Wielkich Liczb</strong>
                <p className="opacity-90">
                  Przy małej próbie (N=30) średnia z badania może być dziełem przypadku. Im większa próba, tym wynik badania jest bliższy "prawdziwej" średniej w populacji, a błąd pomiaru (SEM) maleje.
                </p>
              </div>
            </div>

            {/* Slider: Correlation */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Spójność Pytań</label>
                <span className="text-sm font-bold text-indigo-600">{Math.round(itemCohesion * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={itemCohesion}
                onChange={(e) => setItemCohesion(Number(e.target.value))}
                disabled={isSimulating}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-xs text-slate-400 mt-1">
                Jak bardzo pytania korelują ze sobą? (Wpływa na Alfę Cronbacha).
              </p>
            </div>

             {/* Slider: Theoretical Quality */}
             <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500"/> Jakość Teoretyczna
                </label>
                <span className="text-sm font-bold text-indigo-600">{Math.round(constructQuality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.95"
                step="0.05"
                value={constructQuality}
                onChange={(e) => setConstructQuality(Number(e.target.value))}
                disabled={isSimulating}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Kluczowy parametr. Wpływa na trafność kryterialną (Manna-Whitneya) oraz dopasowanie modelu (CFA).
              </p>
            </div>

            <button
              onClick={startSimulation}
              disabled={isSimulating}
              className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex justify-center items-center gap-2
                ${isSimulating ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02]'}
              `}
            >
              {isSimulating ? (
                <>Obliczanie...</>
              ) : (
                <><Play size={18} fill="currentColor" /> Uruchom Badanie</>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: VISUALIZATION & RESULTS */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Progress Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden min-h-[200px] flex flex-col justify-center">
            {isSimulating ? (
              <div className="text-center space-y-4 animate-pulse">
                 <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto animate-spin">
                   <RefreshCcw size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-800">Zbieranie Danych...</h3>
                 <p className="text-slate-500">
                    System generuje odpowiedzi dla grupy kontrolnej i klinicznej.<br/>
                    Przetwarzanie ankiety {currentCount} z {targetSample}
                 </p>
                 <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden max-w-md mx-auto">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                 </div>
              </div>
            ) : lastResult ? (
              <div className="flex flex-col items-center text-center animate-slide-up">
                <div className="text-sm font-bold text-slate-500 uppercase mb-2">Wynik: Rzetelność (Alfa Cronbacha)</div>
                <div className={`text-6xl font-extrabold mb-4 ${getAlphaColor(lastResult.cronbachAlpha)}`}>
                  {lastResult.cronbachAlpha.toFixed(2)}
                </div>
                <div className="flex gap-8 text-left mt-2">
                   <div>
                     <p className="text-xs text-slate-400 uppercase font-bold">Próba (N)</p>
                     <p className="text-lg font-semibold text-slate-700">{lastResult.sampleSize}</p>
                   </div>
                   <div>
                     <p className="text-xs text-slate-400 uppercase font-bold">Effect Size (d)</p>
                     <p className={`text-lg font-semibold ${lastResult.groupComparison.effectSize > 0.5 ? 'text-green-600' : 'text-red-500'}`}>
                       {lastResult.groupComparison.effectSize.toFixed(2)}
                     </p>
                   </div>
                   <div>
                     <p className="text-xs text-slate-400 uppercase font-bold">CFI (Fit)</p>
                     <p className={`text-lg font-semibold ${lastResult.fitIndices.cfi > 0.9 ? 'text-green-600' : 'text-amber-600'}`}>
                       {lastResult.fitIndices.cfi.toFixed(2)}
                     </p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Database size={48} className="mx-auto mb-4 opacity-20" />
                <h4 className="text-lg font-semibold mb-2">Brak danych</h4>
                <p>Skonfiguruj parametry po lewej i kliknij "Uruchom Badanie", aby wygenerować dane.</p>
              </div>
            )}
          </div>

          {/* History Table */}
          {history.length > 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2 text-sm">
                <History size={16} /> Historia Symulacji
              </div>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2">N</th>
                      <th className="px-4 py-2">Spójność</th>
                      <th className="px-4 py-2 text-amber-700">Jakość Teoret.</th>
                      <th className="px-4 py-2">Alfa</th>
                      <th className="px-4 py-2">Błąd (SEM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((run, idx) => (
                      <tr key={run.id} className={`border-b border-slate-200 ${idx === 0 ? 'bg-white font-medium' : 'bg-slate-50 text-slate-500'}`}>
                        <td className="px-4 py-2">{run.n}</td>
                        <td className="px-4 py-2">{Math.round(run.correlation * 100)}%</td>
                         <td className="px-4 py-2">{Math.round(run.quality * 100)}%</td>
                        <td className={`px-4 py-2 ${getAlphaColor(run.alpha)}`}>{run.alpha.toFixed(2)}</td>
                        <td className="px-4 py-2">{run.sem}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between border-t border-slate-200 pt-6">
          <button
            onClick={onBack}
            className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition"
          >
            Wróć
          </button>
          <button
            onClick={onNext}
            disabled={!lastResult || isSimulating}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Przejdź do Analizy Wyników <ArrowRight size={20} />
          </button>
      </div>
    </div>
  );
};

export default StepSimulation;
