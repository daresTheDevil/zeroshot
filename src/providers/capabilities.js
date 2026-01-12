const CAPABILITIES = {
  anthropic: {
    dockerIsolation: true,
    worktreeIsolation: true,
    mcpServers: true,
    jsonSchema: true,
    streamJson: true,
    thinkingMode: true,
    reasoningEffort: false,
  },
  openai: {
    dockerIsolation: true,
    worktreeIsolation: true,
    mcpServers: true,
    jsonSchema: true,
    streamJson: true,
    thinkingMode: true,
    reasoningEffort: true,
  },
  google: {
    dockerIsolation: true,
    worktreeIsolation: true,
    mcpServers: true,
    jsonSchema: 'experimental',
    streamJson: true,
    thinkingMode: true,
    reasoningEffort: false,
  },
};

function checkCapability(provider, capability) {
  const caps = CAPABILITIES[provider];
  if (!caps) return false;
  return caps[capability] === true;
}

function warnIfExperimental(provider, capability) {
  const caps = CAPABILITIES[provider];
  if (caps?.[capability] === 'experimental') {
    console.warn(`⚠️ ${capability} is experimental for ${provider} and may not work reliably`);
  }
}

module.exports = {
  CAPABILITIES,
  checkCapability,
  warnIfExperimental,
};
