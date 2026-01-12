const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadSettings, validateSetting } = require('../lib/settings');
const { validateProviderSettings, validateProviderLevel } = require('../src/config-validator');

describe('Provider settings', function () {
  const testDir = path.join(os.tmpdir(), `zeroshot-provider-settings-${Date.now()}`);
  const settingsFile = path.join(testDir, 'settings.json');

  before(function () {
    fs.mkdirSync(testDir, { recursive: true });
  });

  after(function () {
    delete process.env.ZEROSHOT_SETTINGS_FILE;
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  it('validates defaultProvider values', function () {
    assert.strictEqual(validateSetting('defaultProvider', 'openai'), null);
    const error = validateSetting('defaultProvider', 'invalid-provider');
    assert.ok(error);
  });

  it('validates provider level bounds', function () {
    assert.doesNotThrow(() => {
      validateProviderLevel('openai', 'level2', 'level1', 'level3');
    });

    assert.throws(() => {
      validateProviderLevel('openai', 'level4', 'level1', 'level3');
    }, /Invalid level/);
  });

  it('validates provider overrides and reasoning rules', function () {
    assert.doesNotThrow(() => {
      validateProviderSettings('openai', {
        minLevel: 'level1',
        maxLevel: 'level3',
        defaultLevel: 'level2',
        levelOverrides: {
          level1: { model: 'openai-model-main', reasoningEffort: 'low' },
        },
      });
    });

    assert.throws(() => {
      validateProviderSettings('google', {
        minLevel: 'level1',
        maxLevel: 'level3',
        defaultLevel: 'level2',
        levelOverrides: {
          level2: { reasoningEffort: 'high' },
        },
      });
    }, /reasoningEffort overrides are only supported/);
  });

  it('applies legacy maxModel to anthropic levels', function () {
    process.env.ZEROSHOT_SETTINGS_FILE = settingsFile;
    fs.writeFileSync(settingsFile, JSON.stringify({ maxModel: 'haiku' }, null, 2), 'utf8');

    const settings = loadSettings();
    assert.strictEqual(settings.providerSettings.anthropic.maxLevel, 'level1');
    assert.strictEqual(settings.providerSettings.anthropic.defaultLevel, 'level1');
  });
});
