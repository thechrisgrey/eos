import { Agent } from '../types';

export const AGENTS: Agent[] = [
  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.5)',
    capability:
      'Advanced reasoning, long-context document synthesis, nuanced strategic analysis, coding, honest guidance, constitutional AI principles. Excels at understanding complex problems and delivering thoughtful, well-structured decision support.',
    modelId: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
  },
  {
    id: 'gpt',
    name: 'GPT-OSS',
    provider: 'OpenAI',
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.5)',
    capability:
      'Open-weight large language model optimized for production and general purpose reasoning. Strong at structured output formatting, instruction following, multi-step directives, and building frameworks and templates.',
    modelId: 'openai.gpt-oss-120b-1:0',
  },
  {
    id: 'gemma',
    name: 'Gemma',
    provider: 'Google',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.5)',
    capability:
      'Open-weight model from Google optimized for efficient on-device and cloud inference. Strong at text understanding, summarization, reasoning tasks, and multilingual capabilities with a focus on responsible AI development.',
    modelId: 'google.gemma-3-27b-it',
  },
  {
    id: 'llama',
    name: 'Llama',
    provider: 'Meta',
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.5)',
    capability:
      'Open-source, fine-tunable for specific domains, deployable on-premise for data privacy, cost-efficient inference, adaptable to specialized workflows. Community-driven with strong customization potential for unique business processes.',
    modelId: 'us.meta.llama4-scout-17b-instruct-v1:0',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    provider: 'Mistral AI',
    color: '#2dd4bf',
    glow: 'rgba(45,212,191,0.5)',
    capability:
      'Efficient European AI, multilingual, GDPR-compliant, fast inference, strong at code generation, structured task execution, process-oriented instruction following and generating well-organized structured outputs at scale.',
    modelId: 'mistral.devstral-2-123b',
  },
];
