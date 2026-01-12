# Providers

Zeroshot shells out to provider CLIs. It does not store API keys or manage
authentication. Use each CLI's login flow or API key setup.

## Supported Providers

| Provider  | CLI         | Install                                    |
| --------- | ----------- | ------------------------------------------ |
| Anthropic | Claude Code | `npm install -g @anthropic-ai/claude-code` |
| OpenAI    | Codex       | `npm install -g @openai/codex`             |
| Google    | Gemini      | `npm install -g @google/gemini-cli`        |

## Selecting a Provider

- List providers: `zeroshot providers`
- Set default: `zeroshot providers set-default <provider>`
- Configure levels: `zeroshot providers setup <provider>`
- Override per run: `zeroshot run ... --provider <provider>`
- Env override: `ZEROSHOT_PROVIDER=openai`

## Model Levels

Zeroshot uses provider-agnostic levels:

- `level1`: cheapest/fastest
- `level2`: default
- `level3`: most capable

Set levels per provider in settings:

```json
{
  "providerSettings": {
    "openai": {
      "minLevel": "level1",
      "maxLevel": "level3",
      "defaultLevel": "level2",
      "levelOverrides": {
        "level1": { "model": "openai-model-main", "reasoningEffort": "low" },
        "level3": { "model": "openai-model-main", "reasoningEffort": "xhigh" }
      }
    }
  }
}
```

Notes:

- `reasoningEffort` applies to OpenAI Codex only.
- `model` is still supported as a provider-specific escape hatch.

## Docker Isolation and Credentials

Zeroshot does not inject credentials for non-Anthropic CLIs. When using
`--docker`, mount your provider config directories explicitly.

Examples:

```bash
# Codex
zeroshot run 123 --docker --mount ~/.config/codex:/home/node/.config/codex:ro

# Gemini (use gemini or gcloud config as needed)
zeroshot run 123 --docker --mount ~/.config/gemini:/home/node/.config/gemini:ro
zeroshot run 123 --docker --mount ~/.config/gcloud:/home/node/.config/gcloud:ro
```

Mount presets in `dockerMounts` include: `codex`, `gemini`, `gcloud`, `claude`.

Use `--no-mounts` to disable all credential mounts (you will get a warning if
credentials are missing).
