const MODEL_CATALOG = {
  'openai-model-main': { rank: 1 },
};

const LEVEL_MAPPING = {
  level1: { rank: 1, model: 'openai-model-main', reasoningEffort: 'low' },
  level2: { rank: 2, model: 'openai-model-main', reasoningEffort: 'medium' },
  level3: { rank: 3, model: 'openai-model-main', reasoningEffort: 'xhigh' },
};

const DEFAULT_LEVEL = 'level2';
const DEFAULT_MAX_LEVEL = 'level3';
const DEFAULT_MIN_LEVEL = 'level1';

module.exports = {
  MODEL_CATALOG,
  LEVEL_MAPPING,
  DEFAULT_LEVEL,
  DEFAULT_MAX_LEVEL,
  DEFAULT_MIN_LEVEL,
};
