function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseItem(item) {
  const events = [];

  if (item.type === 'message' && item.role === 'assistant') {
    const content = Array.isArray(item.content)
      ? item.content
      : [{ type: 'text', text: item.content }];
    const text = content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('');
    const thinking = content
      .filter((c) => c.type === 'thinking' || c.type === 'reasoning')
      .map((c) => c.text)
      .join('');
    if (text) events.push({ type: 'text', text });
    if (thinking) events.push({ type: 'thinking', text: thinking });
  }

  if (item.type === 'function_call') {
    const toolId = item.call_id || item.id || item.tool_call_id || item.tool_id;
    const args =
      typeof item.arguments === 'string' ? safeJsonParse(item.arguments, {}) : item.arguments || {};
    events.push({
      type: 'tool_call',
      toolName: item.name,
      toolId,
      input: args,
    });
  }

  if (item.type === 'function_call_output') {
    const toolId = item.call_id || item.id || item.tool_call_id || item.tool_id;
    const content = item.output ?? item.result ?? item.content ?? '';
    events.push({
      type: 'tool_result',
      toolId,
      content,
      isError: !!item.error,
    });
  }

  if (events.length === 1) return events[0];
  if (events.length > 1) return events;
  return null;
}

function parseEvent(line, options = {}) {
  let event;
  try {
    event = JSON.parse(line);
  } catch {
    return null;
  }

  switch (event.type) {
    case 'thread.started':
      return null;

    case 'item.created':
      return parseItem(event.item);

    case 'turn.completed': {
      const usage = event.usage || event.response?.usage || {};
      return {
        type: 'result',
        success: true,
        inputTokens: usage.input_tokens || 0,
        outputTokens: usage.output_tokens || 0,
      };
    }

    case 'turn.failed':
      return {
        type: 'result',
        success: false,
        error: event.error?.message || event.error || 'Turn failed',
      };

    default:
      if (options.onUnknown) {
        options.onUnknown(event.type, event);
      }
      return null;
  }
}

function parseChunk(chunk, options = {}) {
  const events = [];
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;
    const event = parseEvent(line, options);
    if (!event) continue;
    if (Array.isArray(event)) {
      events.push(...event);
    } else {
      events.push(event);
    }
  }

  return events;
}

module.exports = {
  parseEvent,
  parseChunk,
  parseItem,
  safeJsonParse,
};
