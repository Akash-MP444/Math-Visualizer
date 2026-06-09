/**
 * Tokenizer: splits a raw equation string into meaningful tokens.
 */

export type TokenType =
  | 'number'
  | 'identifier'
  | 'operator'
  | 'lparen'
  | 'rparen'
  | 'equals'
  | 'unknown';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

const IDENTIFIER_RE = /^[a-zA-Z_][a-zA-Z0-9_]*/;
const NUMBER_RE = /^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/;
const OPERATOR_RE = /^[+\-*/^]/;

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = input.trim();

  while (i < s.length) {
    const ch = s[i];
    if (!ch) break;

    if (/\s/.test(ch)) { i++; continue; }

    const numMatch = s.slice(i).match(NUMBER_RE);
    if (numMatch?.[0]) {
      tokens.push({ type: 'number', value: numMatch[0], position: i });
      i += numMatch[0].length;
      continue;
    }

    const idMatch = s.slice(i).match(IDENTIFIER_RE);
    if (idMatch?.[0]) {
      tokens.push({ type: 'identifier', value: idMatch[0], position: i });
      i += idMatch[0].length;
      continue;
    }

    if (ch === '=') { tokens.push({ type: 'equals', value: '=', position: i }); i++; continue; }
    if (ch === '(') { tokens.push({ type: 'lparen', value: '(', position: i }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'rparen', value: ')', position: i }); i++; continue; }

    const opMatch = s.slice(i).match(OPERATOR_RE);
    if (opMatch?.[0]) {
      tokens.push({ type: 'operator', value: opMatch[0], position: i });
      i++; continue;
    }

    tokens.push({ type: 'unknown', value: ch, position: i });
    i++;
  }

  return tokens;
}

export function extractVariables(tokens: Token[]): string[] {
  const KNOWN_FUNCTIONS = new Set([
    'sin', 'cos', 'tan', 'sqrt', 'abs', 'exp', 'ln', 'log',
    'floor', 'ceil', 'pow', 'sinh', 'cosh', 'tanh',
    'asin', 'acos', 'atan', 'atan2', 'max', 'min', 'pi', 'e',
  ]);

  const vars: string[] = [];
  const seen = new Set<string>();
  for (const tok of tokens) {
    if (tok.type === 'identifier' && !KNOWN_FUNCTIONS.has(tok.value) && !seen.has(tok.value)) {
      seen.add(tok.value);
      vars.push(tok.value);
    }
  }
  return vars.sort();
}

export function validateBrackets(input: string): string | null {
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '(') depth++;
    else if (input[i] === ')') {
      depth--;
      if (depth < 0) return `Unexpected closing parenthesis at position ${i + 1}`;
    }
  }
  if (depth > 0) return `Missing ${depth} closing parenthesis${depth > 1 ? 'es' : ''}`;
  return null;
}
