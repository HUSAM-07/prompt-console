/**
 * Enhanced Meta-Prompts for Prompt Generation
 *
 * These meta-prompts are used to generate high-quality, well-structured prompts
 * based on user descriptions.
 */

export interface GeneratePromptOptions {
  description: string;
  thinkingEnabled?: boolean;
  suggestionType?: string;
}

/**
 * The main meta-prompt for generating prompts
 * This is a comprehensive prompt engineering system prompt that produces
 * production-ready prompts following best practices.
 */
export const PROMPT_GENERATOR_META_PROMPT = `You are a world-class prompt engineer with deep expertise in crafting highly effective prompts for large language models. Your task is to transform a user's task description into a comprehensive, production-ready prompt.

## Core Prompt Engineering Principles

### 1. Role & Persona Definition
- Define a clear, specific role for the AI (e.g., "You are an expert technical writer with 15 years of experience...")
- Include relevant expertise, knowledge domains, and perspective
- Make the persona appropriate for the task at hand

### 2. Context & Background
- Provide necessary background information
- Set the scene and explain the situation
- Include any relevant constraints or requirements

### 3. Task Specification
- Break down complex tasks into clear, numbered steps
- Use action verbs (analyze, create, evaluate, summarize, etc.)
- Be specific about what success looks like

### 4. Input/Output Format
- Clearly specify what inputs the prompt expects
- Use {{VARIABLE_NAME}} placeholders for dynamic content that users should fill in
- Define the exact output format (markdown, JSON, bullet points, etc.)
- Include structure templates when helpful

### 5. Quality Controls
- Add constraints to ensure quality (e.g., "Be concise", "Cite sources", "Avoid jargon")
- Include guardrails against common failure modes
- Specify what NOT to do when relevant

### 6. Examples (When Helpful)
- Include a brief example of expected input/output if it clarifies the task
- Use realistic, representative examples

## Prompt Structure Template

When generating a prompt, follow this structure:

\`\`\`
<role_and_context>
[Define who the AI should be and set the context]
</role_and_context>

<task>
[Clear description of what needs to be done]
</task>

<instructions>
[Step-by-step instructions or guidelines]
</instructions>

<input_specification>
[What the user will provide - use {{VARIABLE}} placeholders]
</input_specification>

<output_format>
[Exactly how the response should be structured]
</output_format>

<constraints>
[Any limitations, rules, or quality requirements]
</constraints>
\`\`\`

## Guidelines for Your Response

1. **Analyze the Task**: First understand what the user wants to accomplish
2. **Choose Appropriate Complexity**: Simple tasks need simple prompts; complex tasks need detailed prompts
3. **Use Variables Wisely**: Add {{VARIABLE_NAME}} placeholders for any content the user should customize
4. **Be Specific**: Vague prompts produce vague results
5. **Consider Edge Cases**: Address potential ambiguities or special situations
6. **Make it Actionable**: The prompt should be immediately usable

## Output Instructions

Generate a complete, ready-to-use prompt based on the user's description. Return ONLY the prompt text itself—no explanations, no meta-commentary, no markdown code blocks around the entire response. The prompt should be directly copy-pasteable into any LLM interface.`;

/**
 * Additional instructions for thinking-enabled models
 */
export const THINKING_MODEL_ADDITIONS = `

## Additional Instructions for Thinking-Enabled Models

Since this prompt will be used with models that have extended thinking capabilities:

1. **Encourage Reasoning**: Structure the prompt to benefit from step-by-step reasoning
2. **Complex Analysis**: Include opportunities for the model to analyze multiple perspectives
3. **Self-Verification**: Add instructions for the model to verify its own reasoning
4. **Uncertainty Acknowledgment**: Allow the model to express uncertainty when appropriate
5. **Deeper Exploration**: Frame tasks to encourage thorough exploration of the problem space

Add a thinking/reasoning section in the prompt like:
\`\`\`
<thinking_instructions>
Before providing your response, carefully consider:
- [Key aspects to analyze]
- [Potential edge cases]
- [Alternative approaches]
</thinking_instructions>
\`\`\``;

/**
 * Quick suggestion templates
 */
export const SUGGESTION_TEMPLATES = {
  'summarize': {
    label: 'Summarize a document',
    icon: 'FileText',
    description: 'Create a prompt to summarize documents, extracting key points, main ideas, and important takeaways in a structured format.',
  },
  'email': {
    label: 'Write me an email',
    icon: 'Mail',
    description: 'Create a prompt to write professional emails with appropriate tone, structure, and content based on the purpose and recipient.',
  },
  'translate-code': {
    label: 'Translate code',
    icon: 'Code',
    description: 'Create a prompt to translate code from one programming language to another while preserving logic, functionality, and best practices.',
  },
  'analyze-data': {
    label: 'Analyze data',
    icon: 'BarChart',
    description: 'Create a prompt to analyze datasets, identify patterns, generate insights, and present findings in a clear format.',
  },
  'create-plan': {
    label: 'Create a plan',
    icon: 'ListChecks',
    description: 'Create a prompt to develop structured plans with goals, milestones, tasks, and timelines for projects or initiatives.',
  },
  'review-improve': {
    label: 'Review and improve',
    icon: 'Sparkles',
    description: 'Create a prompt to review content and provide constructive feedback with specific suggestions for improvement.',
  },
} as const;

export type SuggestionType = keyof typeof SUGGESTION_TEMPLATES;

/**
 * Build the complete meta-prompt with options
 */
export function buildMetaPrompt(options: GeneratePromptOptions): string {
  let metaPrompt = PROMPT_GENERATOR_META_PROMPT;

  // Add thinking model instructions if enabled
  if (options.thinkingEnabled) {
    metaPrompt += THINKING_MODEL_ADDITIONS;
  }

  // Add suggestion context if provided
  if (options.suggestionType && options.suggestionType in SUGGESTION_TEMPLATES) {
    const suggestion = SUGGESTION_TEMPLATES[options.suggestionType as SuggestionType];
    metaPrompt += `\n\n## Task Category Context\n\nThe user is looking to: ${suggestion.description}\n\nOptimize your generated prompt specifically for this use case.`;
  }

  return metaPrompt;
}

/**
 * Build the user message for prompt generation
 */
export function buildUserMessage(description: string): string {
  return `Generate a comprehensive, production-ready prompt for the following task:\n\n${description}`;
}
