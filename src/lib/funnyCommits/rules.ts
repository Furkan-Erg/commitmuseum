export interface FunnyRule {
  id: string;
  label: string;
  weight: number;
  test: (message: string) => boolean;
}

const REPEATED_WORD = /\b(\w+)\s+\1\b/i;
const FRUSTRATION = /\b(oops|whoops|argh+|ugh+|damn it|wtf|omg|ffs)\b/i;
const PLACEHOLDER = /^(wip|temp|tmp|asdf+|test+|xxx+|misc|\.+|fix)$/i;
const EXCESSIVE_PUNCTUATION = /[!?]{3,}/;
const EMOJI_PATTERN = /\p{Extended_Pictographic}/gu;
const PROFANITY = /\b(shit\w*|fuck\w*|damn\w*|hell|crap\w*)\b/i;
const REVERT_CHAIN = /revert.*revert/i;
const CONFESSION =
  /\b(i\s+(broke|screwed up|messed up)|no idea why|please work|pray(ing)?|fingers crossed)\b/i;
const FINAL_VERSION_JOKE =
  /\bfinal[_ -]?(v2|version|final|for real|for real this time)\b/i;

function isAllCapsYelling(message: string): boolean {
  const letters = message.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 5) return false;
  const upper = letters.replace(/[^A-Z]/g, "");
  return upper.length / letters.length > 0.7;
}

function hasMultipleEmoji(message: string): boolean {
  const matches = message.match(EMOJI_PATTERN);
  return (matches?.length ?? 0) >= 2;
}

export const FUNNY_RULES: FunnyRule[] = [
  { id: "frustration", label: "Frustration", weight: 2, test: (m) => FRUSTRATION.test(m) },
  { id: "repeated-word", label: "Repeated word", weight: 3, test: (m) => REPEATED_WORD.test(m) },
  {
    id: "placeholder",
    label: "Placeholder message",
    weight: 2,
    test: (m) => PLACEHOLDER.test(m.trim()),
  },
  {
    id: "excessive-punctuation",
    label: "Excessive punctuation",
    weight: 1,
    test: (m) => EXCESSIVE_PUNCTUATION.test(m),
  },
  { id: "all-caps", label: "ALL CAPS", weight: 2, test: isAllCapsYelling },
  { id: "emoji", label: "Emoji-heavy", weight: 1, test: hasMultipleEmoji },
  { id: "profanity", label: "Colorful language", weight: 3, test: (m) => PROFANITY.test(m) },
  { id: "revert-chain", label: "Revert chain", weight: 3, test: (m) => REVERT_CHAIN.test(m) },
  { id: "confession", label: "Confession", weight: 2, test: (m) => CONFESSION.test(m) },
  {
    id: "final-version-joke",
    label: '"Final" version joke',
    weight: 1,
    test: (m) => FINAL_VERSION_JOKE.test(m),
  },
];
