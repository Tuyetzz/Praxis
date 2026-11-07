// src/infrastructure/utils/sanitize.js
/**
 * Input sanitization utilities to prevent prompt injection and sanitize user input.
 */

/**
 * Sanitize user input to prevent prompt injection attacks.
 * Removes common prompt injection patterns and limits length.
 *
 * @param {string} input - Raw user input
 * @param {Object} options - Sanitization options
 * @param {number} options.maxLength - Maximum allowed length (default: 12000)
 * @param {boolean} options.allowNewlines - Whether to allow newlines (default: true)
 * @returns {string} Sanitized input
 */
function sanitizeUserInput(input, options = {}) {
  const { maxLength = 12000, allowNewlines = true } = options;

  if (typeof input !== "string") {
    return "";
  }

  let sanitized = input;

  // Remove common prompt injection patterns
  const injectionPatterns = [
    /ignore\s+all\s+(previous|prior|above)\s+(instructions|rules|prompts?)/gi,
    /forget\s+(everything|all|previous)\s+(instructions|rules|prompts?)/gi,
    /you\s+are\s+(now|an?)\s+(?!a\s+quiz\s+author)/gi,
    /system\s*:\s*/gi,
    /assistant\s*:\s*/gi,
    /human\s*:\s*/gi,
    /user\s*:\s*/gi,
    /<\|.*?\|>/g, // Special tokens
    /\[INST\].*?\[\/INST\]/gis, // Instruction tags
    /<<.*?>>/g, // Angle bracket injections
    /\b(api[_-]?key|secret|password|token|credential)\b/gi, // Credential references
    /(give|show|tell|output|print|display|reveal|leak|expose)\s+(me\s+)?(the\s+)?(api[_-]?key|secret|password|token|credential)/gi,
  ];

  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }

  // Remove any content that tries to override the system prompt
  const systemPromptOverrides = [
    /you\s+are\s+(now\s+)?(an?\s+)?(admin|developer|root|superuser)/gi,
    /(new|updated?)\s+(system|instruction|prompt|rule)s?/gi,
    /disregard\s+(previous|prior|all)\s+(instructions?|rules?|prompts?)/gi,
    /override\s+(the\s+)?(system\s+)?(prompt|instruction)/gi,
  ];

  for (const pattern of systemPromptOverrides) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength) + "...";
  }

  return sanitized;
}

/**
 * Check if input contains potential prompt injection patterns.
 * Returns an object with detection results.
 *
 * @param {string} input - Raw user input
 * @returns {Object} { hasInjection: boolean, patterns: string[] }
 */
function detectPromptInjection(input) {
  if (typeof input !== "string") {
    return { hasInjection: false, patterns: [] };
  }

  const injectionPatterns = [
    { name: "ignore_instructions", pattern: /ignore\s+(all\s+)?(the\s+)?(previous|prior|above|earlier)\s+(instructions|rules|prompts?|context)/gi },
    { name: "forget_instructions", pattern: /forget\s+(everything|all|previous|your)\s+(instructions|rules|prompts?|training)/gi },
    { name: "role_override", pattern: /you\s+are\s+(now|no longer)\s+(an?\s+)?/gi },
    { name: "role_override", pattern: /(act|behave|pretend)\s+(as|like)\s+(an?\s+)?(admin|developer|root|superuser|assistant)/gi },
    // "system:" is a classic injection prefix, but also a legitimate topic
    // label ("System: the circulatory system"). Only treat it as an injection
    // when it introduces an instruction to the model.
    { name: "system_prompt", pattern: /(^|\n)\s*system\s*(prompt|message)?\s*:\s*(you|ignore|disregard|forget|from\s+now|always|never|do\s+not|new\s+)/gi },
    { name: "assistant_prompt", pattern: /assistant\s*:/gi },
    { name: "human_prompt", pattern: /human\s*:/gi },
    { name: "user_prompt", pattern: /user\s*:/gi },
    { name: "special_tokens", pattern: /<\|.*?\|>/g },
    { name: "instruction_tags", pattern: /\[\/?INST\]/gi },
    { name: "angle_brackets", pattern: /<<.*?>>/g },
    // Credential hunting: catch requests for secrets, with or without "the",
    // and regardless of where the secret name appears in the sentence.
    { name: "credential_requests", pattern: /\b(give|show|tell|send|output|print|display|reveal|leak|expose|list|dump|repeat|return|share)\b[^.!?]{0,60}\b(api[_\s-]?key|secret|password|passwords|token|credential|credentials|env|environment\s+variable)/gi },
    { name: "credential_requests", pattern: /\b(api[_\s-]?key|secret|password|passwords|token|credential)s?\b[^.!?]{0,40}\b(give|show|tell|reveal|leak|expose|print|output)/gi },
    { name: "prompt_extraction", pattern: /\b(reveal|show|repeat|print|output|display|tell\s+me)\b[^.!?]{0,40}\b(system\s+prompt|instructions|your\s+rules|initial\s+prompt)/gi },
    { name: "new_instructions", pattern: /\b(new|updated?|revised)\s+(system\s+)?(instructions?|prompts?|rules?)\b/gi },
    { name: "disregard", pattern: /disregard\s+(all\s+)?(the\s+)?(previous|prior|above)\s+(instructions?|rules?|prompts?)/gi },
    { name: "override_prompt", pattern: /override\s+(the\s+)?(system\s+)?(prompt|instruction|setting)/gi },
    { name: "jailbreak", pattern: /\b(dan\s+mode|developer\s+mode|jailbreak|bypass\s+(your\s+)?(rules|filter|safety))/gi },
  ];

  const detected = [];

  for (const { name, pattern } of injectionPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(input)) {
      detected.push(name);
    }
  }

  return {
    hasInjection: detected.length > 0,
    patterns: [...new Set(detected)],
  };
}

/**
 * Escape special characters that could break JSON or prompt structure.
 * @param {string} input
 * @returns {string}
 */
function escapeForPrompt(input) {
  if (typeof input !== "string") return "";
  return input
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Validate that the input doesn't contain dangerous patterns.
 * Throws an error if dangerous patterns are found.
 * @param {string} input
 * @throws {Error} If dangerous patterns detected
 */
function validateInputSafety(input) {
  const dangerousPatterns = [
    /\b(eval|exec|system|shell|command|process)\s*\(/gi,
    /(require|import)\s*\(/gi,
    /__proto__|constructor\.prototype/gi,
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      throw new Error("Input contains potentially dangerous content.");
    }
  }
}

module.exports = {
  sanitizeUserInput,
  escapeForPrompt,
  validateInputSafety,
  detectPromptInjection,
};