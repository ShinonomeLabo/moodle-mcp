import { z } from 'zod';
import { MoodleClient } from '../services/moodleClient.js';

export const GetModelsSchema = z.object({
  includeDisabled: z.boolean().optional().describe('Include disabled models'),
});

export const GetModelSchema = z.object({
  modelId: z.number().describe('Model ID'),
});

export const EnableModelSchema = z.object({
  modelId: z.number().describe('Model ID'),
  enable: z.boolean().describe('Enable or disable the model'),
});

export const TrainModelSchema = z.object({
  modelId: z.number().describe('Model ID'),
});

export const PredictModelSchema = z.object({
  modelId: z.number().describe('Model ID'),
});

export const EvaluateModelSchema = z.object({
  modelId: z.number().describe('Model ID'),
  timeSplittingId: z.string().optional().describe('Time splitting method ID'),
  includeTrainingData: z.boolean().optional().describe('Include training data in evaluation'),
});

export const GetInsightsSchema = z.object({
  modelId: z.number().optional().describe('Model ID (optional)'),
  contextId: z.number().optional().describe('Context ID (optional)'),
  userId: z.number().optional().describe('User ID (optional)'),
  status: z.enum(['notviewed', 'viewed', 'fixed', 'notuseful']).optional(),
});

export const MarkInsightViewedSchema = z.object({
  insightId: z.number().describe('Insight ID'),
});

export const MarkInsightFixedSchema = z.object({
  insightId: z.number().describe('Insight ID'),
});

export const MarkInsightNotUsefulSchema = z.object({
  insightId: z.number().describe('Insight ID'),
});

export const GetIndicatorsSchema = z.object({
  includeDisabled: z.boolean().optional().describe('Include disabled indicators'),
});

export const EnableIndicatorSchema = z.object({
  indicatorId: z.string().describe('Indicator ID'),
  enable: z.boolean().describe('Enable or disable the indicator'),
});

export const GetTargetsSchema = z.object({
  includeDisabled: z.boolean().optional().describe('Include disabled targets'),
});

export const GetTimeSplittingsSchema = z.object({
  includeDisabled: z.boolean().optional().describe('Include disabled time splitting methods'),
});

export class AnalyticsHandlers {
  constructor(private moodleClient: MoodleClient) {}

  async handleGetModels(params: z.infer<typeof GetModelsSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_get_models',
      {
        includedisabled: params.includeDisabled,
      }
    );
    return result;
  }

  async handleGetModel(params: z.infer<typeof GetModelSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_get_model',
      {
        modelid: params.modelId,
      }
    );
    return result;
  }

  async handleEnableModel(params: z.infer<typeof EnableModelSchema>) {
    const functionName = params.enable
      ? 'core_analytics_enable_model'
      : 'core_analytics_disable_model';
    
    const result = await this.moodleClient.callFunction(functionName, {
      modelid: params.modelId,
    });
    return result;
  }

  async handleTrainModel(params: z.infer<typeof TrainModelSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_train_model',
      {
        modelid: params.modelId,
      }
    );
    return result;
  }

  async handlePredictModel(params: z.infer<typeof PredictModelSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_predict_model',
      {
        modelid: params.modelId,
      }
    );
    return result;
  }

  async handleEvaluateModel(params: z.infer<typeof EvaluateModelSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_evaluate_model',
      {
        modelid: params.modelId,
        timesplittingid: params.timeSplittingId,
        includetrainingdata: params.includeTrainingData,
      }
    );
    return result;
  }

  async handleGetInsights(params: z.infer<typeof GetInsightsSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_get_insights',
      {
        modelid: params.modelId,
        contextid: params.contextId,
        userid: params.userId,
        status: params.status,
      }
    );
    return result;
  }

  async handleMarkInsightViewed(params: z.infer<typeof MarkInsightViewedSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_mark_insight_viewed',
      {
        insightid: params.insightId,
      }
    );
    return result;
  }

  async handleMarkInsightFixed(params: z.infer<typeof MarkInsightFixedSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_mark_insight_fixed',
      {
        insightid: params.insightId,
      }
    );
    return result;
  }

  async handleMarkInsightNotUseful(params: z.infer<typeof MarkInsightNotUsefulSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_mark_insight_not_useful',
      {
        insightid: params.insightId,
      }
    );
    return result;
  }

  async handleGetIndicators(params: z.infer<typeof GetIndicatorsSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_get_indicators',
      {
        includedisabled: params.includeDisabled,
      }
    );
    return result;
  }

  async handleEnableIndicator(params: z.infer<typeof EnableIndicatorSchema>) {
    const functionName = params.enable
      ? 'core_analytics_enable_indicator'
      : 'core_analytics_disable_indicator';
    
    const result = await this.moodleClient.callFunction(functionName, {
      indicatorid: params.indicatorId,
    });
    return result;
  }

  async handleGetTargets(params: z.infer<typeof GetTargetsSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_get_targets',
      {
        includedisabled: params.includeDisabled,
      }
    );
    return result;
  }

  async handleGetTimeSplittings(params: z.infer<typeof GetTimeSplittingsSchema>) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_get_time_splittings',
      {
        includedisabled: params.includeDisabled,
      }
    );
    return result;
  }

  async handleGetModelStats(modelId: number) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_get_model_stats',
      {
        modelid: modelId,
      }
    );
    return result;
  }

  async handleClearModelPredictions(modelId: number) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_clear_model_predictions',
      {
        modelid: modelId,
      }
    );
    return result;
  }

  async handleExportModel(modelId: number) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_export_model',
      {
        modelid: modelId,
      }
    );
    return result;
  }

  async handleImportModel(modelData: string) {
    const result = await this.moodleClient.callFunction(
      'core_analytics_import_model',
      {
        modeldata: modelData,
      }
    );
    return result;
  }
} 