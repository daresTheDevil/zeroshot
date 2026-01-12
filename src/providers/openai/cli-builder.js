function buildCommand(context, options = {}) {
  const { modelSpec, outputFormat, jsonSchema, cwd, autoApprove, cliFeatures = {} } = options;

  const args = ['exec'];

  if ((outputFormat === 'stream-json' || outputFormat === 'json') && cliFeatures.supportsJson) {
    args.push('--json');
  }

  if (modelSpec?.model) {
    args.push('-m', modelSpec.model);
  }

  if (modelSpec?.reasoningEffort && cliFeatures.supportsConfigOverride) {
    args.push('--config', `model_reasoning_effort="${modelSpec.reasoningEffort}"`);
  }

  if (cwd && cliFeatures.supportsCwd) {
    args.push('-C', cwd);
  }

  if (autoApprove && cliFeatures.supportsAutoApprove) {
    args.push('--dangerously-bypass-approvals-and-sandbox');
  }

  if (jsonSchema && cliFeatures.supportsOutputSchema) {
    args.push(
      '--output-schema',
      typeof jsonSchema === 'string' ? jsonSchema : JSON.stringify(jsonSchema)
    );
  }

  args.push(context);

  return {
    binary: 'codex',
    args,
    env: {},
  };
}

module.exports = {
  buildCommand,
};
