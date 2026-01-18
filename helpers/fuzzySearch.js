import * as fuzzball from "fuzzball";

/**
 * Normalize search term for consistent matching
 * @param {string} term - The search term to normalize
 * @returns {string} - Normalized search term
 */
export const normalizeSearchTerm = (term) => {
  if (!term) return "";
  // Convert to lowercase and trim whitespace
  // Preserve alphanumeric characters, spaces, and hyphens
  return term.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "");
};

/**
 * Calculate fuzzy score for a single product against search term
 * @param {string} searchTerm - The normalized search term
 * @param {Object} product - The product object with name, description, keywords
 * @returns {number} - Fuzzy match score (0-100)
 */
export const calculateFuzzyScore = (searchTerm, product) => {
  if (!searchTerm || !product) return 0;

  const normalized = normalizeSearchTerm(searchTerm);

  // Calculate name similarity (weighted higher)
  const nameScore = fuzzball.ratio(
    normalized,
    normalizeSearchTerm(product.name || "")
  );

  // Calculate description similarity using partial ratio
  const descScore = fuzzball.partial_ratio(
    normalized,
    normalizeSearchTerm(product.description || "")
  );

  // Calculate keyword similarities
  let maxKeywordScore = 0;
  if (product.keywords && Array.isArray(product.keywords)) {
    const keywordScores = product.keywords.map((kw) =>
      fuzzball.ratio(normalized, normalizeSearchTerm(kw))
    );
    maxKeywordScore = Math.max(0, ...keywordScores);
  }

  // Weight the scores: name (1.5x), keywords (1.2x), description (1x)
  const weightedNameScore = nameScore * 1.5;
  const weightedKeywordScore = maxKeywordScore * 1.2;

  // Return the highest weighted score (capped at 100)
  return Math.min(
    100,
    Math.max(weightedNameScore, weightedKeywordScore, descScore)
  );
};

/**
 * Perform fuzzy matching on products array
 * @param {string} searchTerm - The user's search query
 * @param {Array} products - Array of product objects to search
 * @param {number} threshold - Minimum score threshold (default: 70)
 * @returns {Array} - Array of {product, score} objects sorted by score
 */
export const fuzzyMatchProducts = (searchTerm, products, threshold = 70) => {
  if (!searchTerm || !products || !Array.isArray(products)) {
    return [];
  }

  // Skip fuzzy matching for very short terms (1-2 characters)
  if (searchTerm.trim().length <= 2) {
    return [];
  }

  // Calculate scores for all products
  const scoredProducts = products
    .map((product) => ({
      product,
      score: calculateFuzzyScore(searchTerm, product),
    }))
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score); // Sort by score descending

  return scoredProducts;
};
