
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface EconomicConcept {
  id: string;
  title: string;
  description: string;
  examples: string[];
  category: 'basic' | 'intermediate' | 'advanced';
}

export interface PolicySimulation {
  id: string;
  name: string;
  description: string;
  impactAreas: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  historicalExamples: {
    year: number;
    country: string;
    outcome: string;
  }[];
}

export interface VisualizationData {
  type: 'supply-demand' | 'gdp-growth' | 'inflation' | 'unemployment' | 'custom';
  title: string;
  xAxis: {
    title: string;
    data: (string | number)[];
  };
  yAxis: {
    title: string;
    data: number[];
  };
  series: {
    name: string;
    data: number[];
    // Define more explicit types for ECharts compatibility
    type: 'line' | 'bar' | 'scatter' | 'area';
  }[];
}

export type AnimationVariant = 
  | 'fade' 
  | 'slide-up' 
  | 'slide-down' 
  | 'scale' 
  | 'blur';
