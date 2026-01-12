function buildCommand(context, options = {}) {
  const { modelSpec, outputFormat, cwd, autoApprove, cliFeatures = {} } = options;

  const args = ['-p', context];

  if (
    (outputFormat === 'stream-json' || outputFormat === 'json') &&
    cliFeatures.supportsStreamJson
  ) {
    args.push('--output-format', 'stream-json');
  }

  if (modelSpec?.model) {
    args.push('-m', modelSpec.model);
  }

  if (cwd && cliFeatures.supportsCwd) {
    args.push('--cwd', cwd);
  }

  if (autoApprove && cliFeatures.supportsAutoApprove) {
    args.push('--yolo');
  }

  return {
    binary: 'gemini',
    args,
    env: {},
  };
}

module.exports = {
  buildCommand,
};
