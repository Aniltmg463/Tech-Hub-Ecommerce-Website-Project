// // Jaccard similarity helper
// // Supports inputs as arrays or strings. If strings are provided, they are tokenized by whitespace.

// export function toSet(input) {
//   if (Array.isArray(input)) return new Set(input);
//   if (typeof input === "string") return new Set(input.split(/\s+/).filter(Boolean));
//   if (input instanceof Set) return input;
//   // fallback: attempt to iterate
//   try {
//     return new Set([...input]);
//   } catch (e) {
//     return new Set();
//   }
// }

// export function jaccardSimilarity(a, b) {
//   const A = toSet(a);
//   const B = toSet(b);
//   if (A.size === 0 && B.size === 0) return 1; // both empty -> identical
//   const intersection = new Set([...A].filter((x) => B.has(x)));
//   const union = new Set([...A, ...B]);
//   return intersection.size / union.size;
// }

// export function jaccardDetailed(a, b) {
//   const A = toSet(a);
//   const B = toSet(b);
//   const intersection = new Set([...A].filter((x) => B.has(x)));
//   const union = new Set([...A, ...B]);
//   const score = union.size === 0 ? 1 : intersection.size / union.size;
//   return {
//     score,
//     intersection: [...intersection],
//     union: [...union],
//     intersectionSize: intersection.size,
//     unionSize: union.size,
//   };
// }


/**
 * Tokenizes a string into an array of lowercase words
 * @param {string} text - The text to tokenize
 * @returns {string[]} Array of tokens
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * Calculates Jaccard similarity with detailed information
 * @param {string|string[]} setA - First set (keywords array or text string)
 * @param {string|string[]} setB - Second set (keywords array or text string)
 * @returns {Object} Object containing score, intersection, and union
 */
export function jaccardDetailed(setA, setB) {
  // Convert to arrays if strings are provided
  const tokensA = Array.isArray(setA) ? setA : tokenize(setA);
  const tokensB = Array.isArray(setB) ? setB : tokenize(setB);

  // Create sets for unique values
  const uniqueA = new Set(tokensA.map(t => String(t).toLowerCase()));
  const uniqueB = new Set(tokensB.map(t => String(t).toLowerCase()));

  // Calculate intersection (common elements)
  const intersection = [...uniqueA].filter(item => uniqueB.has(item));

  // Calculate union (all unique elements)
  const union = new Set([...uniqueA, ...uniqueB]);

  // Calculate Jaccard score: |A ∩ B| / |A ∪ B|
  const score = union.size === 0 ? 0 : intersection.length / union.size;

  return {
    score,
    intersection,
    union: [...union],
  };
}

/**
 * Simple Jaccard similarity (returns only the score)
 * @param {string|string[]} setA - First set
 * @param {string|string[]} setB - Second set
 * @returns {number} Jaccard similarity score (0 to 1)
 */
export function jaccard(setA, setB) {
  return jaccardDetailed(setA, setB).score;
}