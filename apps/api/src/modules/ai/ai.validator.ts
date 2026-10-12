import { z } from 'zod';

export const aiValidationSchema = z.object({
  /** The raw AI output/text */
  rawOutput: z.string().min(1).max(10000),
  /** The task/category the AI was asked to perform */
  task: z.enum(['content_moderation', 'fraud_detection', 'reputation_score', 'content_generation', 'classification']),
  /** Confidence score from the AI model (0-100) */
  confidence: z.number().min(0).max(100).default(50),
  /** Whether the AI recommends a action */
  recommendsAction: z.boolean().default(false),
  /** Action recommended by the AI */
  recommendedAction: z.enum(['allow', 'flag', 'reject', 'human_review']).optional(),
  /** Supporting evidence from the AI analysis */
  evidence: z.string().max(5000).optional(),
  /** Model version used for the output */
  modelVersion: z.string().optional(),
  /** Token usage for tracking */
  tokenUsage: z.object({
    inputTokens: z.number().int().default(0),
    outputTokens: z.number().int().default(0),
  }).optional(),
});

export type AiValidationOutput = z.infer<typeof aiValidationSchema>;

export type AiTask = z.infer<typeof aiValidationSchema>['task'];

export type AiConfidenceRange = {
  min: number;
  max: number;
  threshold: number; // threshold for auto-accept
};

/** Validate AI output against the grounded schema */
export function validateAiOutput(output: unknown): aiValidationOutput {
  return aiValidationSchema.parse(output);
}

/** Check if AI output should be auto-accepted */
function shouldAutoAccept(confidence: number, task: aiValidationOutput['task']): boolean {
  const thresholds: Record<aiValidationOutput['task'], number> = {
    content_moderation: 80,
    fraud_detection: 70,
    reputation_score: 75,
    content_generation: 70,
    classification: 75,
  };

  return confidence >= (thresholds[task] || 70);
}

/** Check if AI output should be routed to human review */
function shouldRouteToHuman(confidence: number, task: aiValidationOutput['task'], hasEvidence: boolean): boolean {
  const lowConfidenceThresholds = {
    content_moderation: 50,
    fraud_detection: 40,
    reputation_score: 45,
    content_generation: 50,
    classification: 45,
  };

  const lowThreshold = lowConfidenceThresholds[task] || 50;
  return confidence < lowThreshold || !hasEvidence;
}

/** Get the recommended action based on AI output */
function getRecommendedAction(output: aiValidationOutput): 'allow' | 'flag' | 'reject' | 'human_review' {
  if (shouldAutoAccept(output.confidence, output.task) && !output.recommendsAction) {
    return 'allow';
  }
  if (output.recommendsAction) {
    return output.recommendedAction as 'allow' | 'flag' | 'reject' | 'human_review';
  }
  if (shouldRouteToHuman(output.confidence, output.task, !!output.evidence)) {
    return 'human_review';
  }
  if (output.confidence < 30) {
    return 'reject';
  }
  return 'flag';
}

/** Grounded AI prompt template for content moderation */
export const contentModerationPrompt = (text: string, context?: string) =>
  `You are a content moderator for a verified local discovery platform in Liberia. 
  
  Evaluate the following text for policy violations, spam, fraud, or inappropriate content.
  
  Platform context: LibFind - Verified local discovery and marketplace platform for Liberia
  Platform values: Verified community, trusted connections, safe marketplace
  
  Text to evaluate: "${text}"
  ${context ? `Context: ${context}` : ''}
  
  Provide output in JSON with these fields:
  - violation: boolean (true if policy violation)
  - violationType: "spam" | "fraud" | "inappropriate" | "none"
  - severity: "low" | "medium" | "high"
  - summary: string (max 200 chars)
  - action: "allow" | "flag" | "reject"
  - confidence: number (0-100)
  
  Respond with ONLY the JSON, no other text.`,
  
/** Grounded AI prompt template for fraud detection */
export const fraudDetectionPrompt = (text: string, context?: string) =>
  `You are a fraud detection analyst for a verified local marketplace in Liberia.
  
  Evaluate the following text for signs of fraud, scams, or suspicious activity.
  
  Platform context: LibFind - Verified local discovery and marketplace platform
  Platform values: Trust, verification, community safety
  
  Text to evaluate: "${text}"
  ${context ? `Context: ${context}` : ''}
  
  Provide output in JSON with these fields:
  - isFraud: boolean
  - fraudType: "phishing" | "scam" | "identity_theft" | "payment_fraud" | "none"
  - confidence: number (0-100)
  - supporting evidence: string (max 500 chars)
  - recommendedAction: "allow" | "flag" | "reject"
  
  Respond with ONLY the JSON, no other text.`,
  
/** Grounded AI prompt template for reputation scoring */
export const reputationScoringPrompt = (userHistory: string, context?: string) =>
  `You are evaluating a user's trust score for a Liberian marketplace platform.
  
  User history summary: "${userHistory}"
  Platform context: LibFind - Verified local discovery and marketplace
  Platform values: Trust, verified community, long-term relationships
  
  Consider these factors:
  - History of verified transactions
  - Review history and ratings
  - Verification status
  - Report history
  - Community standing
  
  Provide output in JSON with these fields:
  - trustScore: number (0-100)
  - positiveReviews: number
  - totalReviews: number
  - averageRating: number (1-5)
  - riskFactors: string[] (list of risk factors)
  - recommendedAction: "enhance_trust" | "investigate" | "restrict"
  - confidence: number (0-100)
  
  Respond with ONLY the JSON, no other text.`,