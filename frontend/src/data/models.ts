import { ModelEntry } from '../types';

export const MODEL_CATALOG: ModelEntry[] = [
  {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.5)',
    capability:
      'The most powerful Claude model. Exceptional at complex reasoning, long-context synthesis, nuanced strategic analysis, coding, and delivering thoughtful decision support with constitutional AI principles.',
    modelId: 'us.anthropic.claude-opus-4-6-v1',
  },
  {
    id: 'nova-premier',
    name: 'Nova Premier',
    provider: 'Amazon',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.5)',
    capability:
      'Amazon\'s most capable foundation model. Excels at complex reasoning, multimodal understanding, agentic workflows, and generating highly accurate responses across diverse enterprise tasks.',
    modelId: 'us.amazon.nova-premier-v1:0',
  },
  {
    id: 'deepseek-v3-2',
    name: 'DeepSeek V3.2',
    provider: 'DeepSeek',
    color: '#38bdf8',
    glow: 'rgba(56,189,248,0.5)',
    capability:
      'Latest DeepSeek model with strong reasoning, code generation, and mathematical problem-solving capabilities. Efficient architecture with mixture-of-experts design for cost-effective high performance.',
    modelId: 'deepseek.v3.2',
  },
  {
    id: 'nemotron-3-30b',
    name: 'Nemotron 3 30B',
    provider: 'NVIDIA',
    color: '#76b900',
    glow: 'rgba(118,185,0,0.5)',
    capability:
      'NVIDIA\'s largest model on Bedrock. Optimized for efficient inference with strong reasoning, instruction following, and code generation capabilities built on NVIDIA\'s accelerated computing expertise.',
    modelId: 'nvidia.nemotron-nano-3-30b',
  },
  {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    color: '#1877f2',
    glow: 'rgba(24,119,242,0.5)',
    capability:
      'Meta\'s top-tier open model. Multimodal (text + image) with strong reasoning, instruction following, and multilingual capabilities. Community-driven with broad customization potential.',
    modelId: 'us.meta.llama4-maverick-17b-instruct-v1:0',
  },
  {
    id: 'mistral-large-3',
    name: 'Mistral Large 3',
    provider: 'Mistral AI',
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.5)',
    capability:
      'Mistral\'s flagship 675B parameter model. Excels at complex multilingual reasoning, code generation, structured task execution, and process-oriented instruction following at enterprise scale.',
    modelId: 'mistral.mistral-large-3-675b-instruct',
  },
  {
    id: 'gpt-oss-120b',
    name: 'GPT-OSS 120B',
    provider: 'OpenAI',
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.5)',
    capability:
      'Open-weight large language model optimized for production and general purpose reasoning. Strong at structured output formatting, instruction following, multi-step directives, and building frameworks.',
    modelId: 'openai.gpt-oss-120b-1:0',
  },
  {
    id: 'kimi-k2-5',
    name: 'Kimi K2.5',
    provider: 'Moonshot AI',
    color: '#f472b6',
    glow: 'rgba(244,114,182,0.5)',
    capability:
      'Moonshot AI\'s flagship multimodal model. Advanced reasoning and vision capabilities with strong performance across benchmarks. Excels at complex analytical tasks and creative problem-solving.',
    modelId: 'moonshotai.kimi-k2.5',
  },
  {
    id: 'qwen3-vl-235b',
    name: 'Qwen3 VL 235B',
    provider: 'Qwen',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.5)',
    capability:
      'Alibaba\'s largest vision-language model on Bedrock. 235B parameters with mixture-of-experts architecture, excelling at multimodal understanding, reasoning, and multilingual tasks across 29+ languages.',
    modelId: 'qwen.qwen3-vl-235b-a22b',
  },
  {
    id: 'palmyra-x5',
    name: 'Palmyra X5',
    provider: 'Writer',
    color: '#2dd4bf',
    glow: 'rgba(45,212,191,0.5)',
    capability:
      'Writer\'s most capable enterprise model. Purpose-built for business content with strong structured output, compliance-aware generation, and enterprise workflow integration capabilities.',
    modelId: 'us.writer.palmyra-x5-v1:0',
  },
  {
    id: 'gemma-3-27b',
    name: 'Gemma 3 27B',
    provider: 'Google',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.5)',
    capability:
      'Google\'s largest open model on Bedrock. Optimized for efficient inference with strong text understanding, summarization, reasoning, and multilingual capabilities focused on responsible AI development.',
    modelId: 'google.gemma-3-27b-it',
  },
  {
    id: 'jamba-1-5-large',
    name: 'Jamba 1.5 Large',
    provider: 'AI21 Labs',
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.5)',
    capability:
      'AI21\'s flagship hybrid SSM-Transformer model. 256K context window with efficient long-document processing, structured data extraction, and enterprise-grade text generation capabilities.',
    modelId: 'ai21.jamba-1-5-large-v1:0',
  },
  {
    id: 'minimax-m2-1',
    name: 'MiniMax M2.1',
    provider: 'MiniMax',
    color: '#a3e635',
    glow: 'rgba(163,230,53,0.5)',
    capability:
      'MiniMax\'s latest model with strong reasoning, creative writing, and code generation. Features extended thinking capabilities and efficient performance across diverse language tasks.',
    modelId: 'minimax.minimax-m2.1',
  },
  {
    id: 'glm-4-7',
    name: 'GLM 4.7',
    provider: 'Z.AI',
    color: '#f87171',
    glow: 'rgba(248,113,113,0.5)',
    capability:
      'Zhipu AI\'s flagship model. Strong bilingual (Chinese-English) capabilities with advanced reasoning, code generation, and tool use. Competitive performance across major benchmarks.',
    modelId: 'zai.glm-4.7',
  },
  {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    color: '#fb7185',
    glow: 'rgba(251,113,133,0.5)',
    capability:
      'Cohere\'s most capable model. Optimized for enterprise RAG, tool use, and multi-step reasoning with strong grounded generation, citation capabilities, and multilingual support across 10+ languages.',
    modelId: 'cohere.command-r-plus-v1:0',
  },
];

export const DEFAULT_SELECTED_IDS = MODEL_CATALOG.slice(0, 6).map((m) => m.id);
