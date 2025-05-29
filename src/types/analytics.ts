export interface AnalyticsModel {
  id: number;
  enabled: boolean;
  trained: boolean;
  name: string;
  target: string;
  indicators: string[];
  timesplitting?: string;
  predictionsprocessor?: string;
  version?: string;
  contextids?: number[];
  timecreated: number;
  timemodified: number;
  usermodified: number;
}

export interface AnalyticsPrediction {
  id: number;
  modelid: number;
  contextid: number;
  sampleid: number;
  rangeindex: number;
  prediction: number;
  predictionscore: number;
  calculations: string;
  timecreated: number;
  timestart: number;
  timeend: number;
}

export interface AnalyticsInsight {
  id: number;
  modelid: number;
  contextid: number;
  contextname: string;
  insightname: string;
  prediction: AnalyticsPrediction;
  actions?: AnalyticsAction[];
  timenotified?: number;
}

export interface AnalyticsAction {
  id: number;
  predictionid: number;
  userid: number;
  actionname: string;
  timecreated: number;
}

export interface AnalyticsEvaluation {
  modelid: number;
  status: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1score?: number;
  auc?: number;
  timesplitting: string;
  starttime: number;
  endtime?: number;
  message?: string;
}

export interface AnalyticsIndicator {
  id: string;
  name: string;
  component: string;
  contextlevels: string[];
  enabled: boolean;
}

export interface AnalyticsTarget {
  id: string;
  name: string;
  component: string;
  contextlevels: string[];
  enabled: boolean;
  callback?: string;
}

export interface AnalyticsTimeSplitting {
  id: string;
  name: string;
  component: string;
  classname: string;
  enabled: boolean;
}

export interface AnalyticsStats {
  modelid: number;
  analysableid: number;
  total: number;
  training: number;
  prediction: number;
  fixed: number;
  notuseful: number;
} 