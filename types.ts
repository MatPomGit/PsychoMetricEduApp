
export interface TestItem {
  id: string;
  text: string;
  type: 'positive' | 'negative'; // Reverse coded items
  qualityScore?: number; // Hidden simulation score
  difficulty?: number; // p-value (0-1)
  discrimination?: number; // item-total correlation
}

export interface SimulationResult {
  cronbachAlpha: number;
  splitHalfReliability: number; // New: Rzetelność połówkowa
  meanScore: number;
  standardDeviation: number;
  sem: number; // Standard Error of Measurement
  confidenceInterval: number; // 95% CI range (+/- value)
  itemCorrelations: { itemId: string; correlation: number }[];
  sampleSize: number;
  
  // New Validity Metrics
  varianceExplained: number; // Factorial Validity (EFA % variance of 1st factor)
  convergentValidity: number; // Correlation with similar construct
  discriminantValidity: number; // Correlation with dissimilar construct
  criterionValidity: number; // Correlation with external criterion

  // New: Structural Validity (Model Fit)
  fitIndices: {
    cfi: number;   // Comparative Fit Index (>0.90 is good)
    rmsea: number; // Root Mean Square Error of Approximation (<0.08 is good)
    srmr: number;  // Standardized Root Mean Square Residual
  };

  // New: Clinical Group Comparison (Mann-Whitney U simulation)
  groupComparison: {
    controlGroupMean: number;
    clinicalGroupMean: number;
    uValue: number;
    pValue: number;
    effectSize: number; // Cohen's d
    distribution: { 
      score: number; 
      controlDensity: number; 
      clinicalDensity: number;
      controlFreq: number; // New: Raw count for histogram
      clinicalFreq: number; // New: Raw count for histogram
    }[];
  };

  // New: IRT Data
  testInformation: { theta: number; info: number; sem: number }[];
}

export enum AppStep {
  DEFINITION = 0,
  ITEM_GENERATION = 1,
  DATA_SIMULATION = 2,
  ANALYSIS = 3,
  NORMS = 4,
}

export interface ConstructDefinition {
  name: string;
  description: string;
}
