/**
 * BaseProvider - Abstract provider interface
 */
class BaseProvider {
  constructor(options = {}) {
    this.name = options.name || 'base';
    this.displayName = options.displayName || 'Base';
    this.cliCommand = options.cliCommand || null;
  }

  isAvailable() {
    throw new Error('Not implemented');
  }

  getCliPath() {
    throw new Error('Not implemented');
  }

  getInstallInstructions() {
    throw new Error('Not implemented');
  }

  getAuthInstructions() {
    throw new Error('Not implemented');
  }

  getCliFeatures() {
    throw new Error('Not implemented');
  }

  getCredentialPaths() {
    return [];
  }

  buildCommand(_context, _options) {
    throw new Error('Not implemented');
  }

  parseEvent(_line) {
    throw new Error('Not implemented');
  }

  getModelCatalog() {
    throw new Error('Not implemented');
  }

  getLevelMapping() {
    throw new Error('Not implemented');
  }

  resolveModelSpec(level, overrides = {}) {
    const mapping = this.getLevelMapping();
    const base = mapping[level] || mapping[this.getDefaultLevel()];
    if (!base) {
      throw new Error(`Unknown level "${level}" for provider "${this.name}"`);
    }
    const override = overrides[level] || {};
    return {
      level,
      model: override.model || base.model,
      reasoningEffort: override.reasoningEffort || base.reasoningEffort,
    };
  }

  validateLevel(level, minLevel, maxLevel) {
    const mapping = this.getLevelMapping();
    const rank = (key) => mapping[key]?.rank;

    if (!mapping[level]) {
      throw new Error(`Invalid level "${level}" for provider "${this.name}"`);
    }

    if (minLevel && !mapping[minLevel]) {
      throw new Error(`Invalid minLevel "${minLevel}" for provider "${this.name}"`);
    }

    if (maxLevel && !mapping[maxLevel]) {
      throw new Error(`Invalid maxLevel "${maxLevel}" for provider "${this.name}"`);
    }

    if (minLevel && maxLevel && rank(minLevel) > rank(maxLevel)) {
      throw new Error(
        `minLevel "${minLevel}" exceeds maxLevel "${maxLevel}" for provider "${this.name}"`
      );
    }

    if (maxLevel && rank(level) > rank(maxLevel)) {
      throw new Error(
        `Level "${level}" exceeds maxLevel "${maxLevel}" for provider "${this.name}"`
      );
    }

    if (minLevel && rank(level) < rank(minLevel)) {
      throw new Error(
        `Level "${level}" is below minLevel "${minLevel}" for provider "${this.name}"`
      );
    }

    return level;
  }

  validateModelId(modelId) {
    const catalog = this.getModelCatalog();
    if (modelId && !catalog[modelId]) {
      throw new Error(`Invalid model "${modelId}" for provider "${this.name}"`);
    }
    return modelId;
  }

  getDefaultLevel() {
    throw new Error('Not implemented');
  }
}

module.exports = BaseProvider;
