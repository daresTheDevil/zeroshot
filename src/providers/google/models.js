const MODEL_CATALOG = {
  'google-tier-1': { rank: 1 },
  'google-tier-2': { rank: 2 },
  'google-tier-3': { rank: 3 },
};

const LEVEL_MAPPING = {
  level1: { rank: 1, model: 'google-tier-1' },
  level2: { rank: 2, model: 'google-tier-2' },
  level3: { rank: 3, model: 'google-tier-3' },
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
