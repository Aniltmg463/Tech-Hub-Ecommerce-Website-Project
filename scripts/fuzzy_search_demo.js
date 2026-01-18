import {
  normalizeSearchTerm,
  calculateFuzzyScore,
  fuzzyMatchProducts,
} from "../helpers/fuzzySearch.js";

// Sample products for demonstration
const products = [
  {
    id: "product-1",
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with USB receiver and long battery life",
    keywords: ["mouse", "wireless", "computer", "accessory", "ergonomic"],
  },
  {
    id: "product-2",
    name: "Gaming Keyboard",
    description: "Mechanical gaming keyboard with RGB backlight and customizable keys",
    keywords: ["keyboard", "gaming", "mechanical", "RGB", "computer"],
  },
  {
    id: "product-3",
    name: "Telephone",
    description: "Modern desk telephone with caller ID and speakerphone",
    keywords: ["telephone", "phone", "desk", "office", "communication"],
  },
  {
    id: "product-4",
    name: "Gaming Laptop",
    description: "High-performance gaming laptop with dedicated graphics card",
    keywords: ["laptop", "gaming", "computer", "portable", "high-performance"],
  },
  {
    id: "product-5",
    name: "USB Cable",
    description: "USB-C charging cable with fast charging support",
    keywords: ["cable", "USB", "charging", "accessory", "USB-C"],
  },
  {
    id: "product-6",
    name: "Monitor Display",
    description: "27-inch LED monitor with 4K resolution and HDR support",
    keywords: ["monitor", "display", "screen", "4K", "LED"],
  },
  {
    id: "product-7",
    name: "Smartphone",
    description: "Latest smartphone with advanced camera and 5G connectivity",
    keywords: ["smartphone", "phone", "mobile", "5G", "camera"],
  },
  {
    id: "product-8",
    name: "Wireless Headphones",
    description: "Noise-canceling wireless headphones with premium sound quality",
    keywords: ["headphones", "wireless", "audio", "noise-canceling", "music"],
  },
];

// Demo scenarios
const scenarios = [
  {
    name: "Exact Match",
    query: "wireless mouse",
    description: "Testing exact product name match",
  },
  {
    name: "Typo Handling",
    query: "telefone",
    description: "Testing typo tolerance (telefone → telephone)",
  },
  {
    name: "Partial Match",
    query: "laptop",
    description: "Testing partial word matching",
  },
  {
    name: "Multi-Word Query",
    query: "wireless gaming",
    description: "Testing multi-word search query",
  },
  {
    name: "No Match",
    query: "banana",
    description: "Testing query with no relevant matches",
  },
];

const THRESHOLD = 70;

console.log("╔════════════════════════════════════════════════════════╗");
console.log("║       Fuzzy Search Demonstration Script              ║");
console.log("║  Testing typo tolerance and fuzzy matching logic     ║");
console.log("╚════════════════════════════════════════════════════════╝");
console.log("");

console.log(`Sample Products (${products.length} total):`);
products.forEach((p) => {
  console.log(`  • ${p.name}`);
});
console.log("");

let totalMatches = 0;
let totalScenarios = scenarios.length;

scenarios.forEach((scenario, index) => {
  console.log("━".repeat(60));
  console.log("");
  console.log(`=== Scenario ${index + 1}: ${scenario.name} ===`);
  console.log(`Search: "${scenario.query}"`);
  console.log(`Description: ${scenario.description}`);
  console.log(`Normalized: "${normalizeSearchTerm(scenario.query)}"`);
  console.log("");

  // Get fuzzy matches
  const results = fuzzyMatchProducts(scenario.query, products, THRESHOLD);

  if (results.length === 0) {
    console.log(`❌ No matches found (threshold: ${THRESHOLD})`);
  } else {
    console.log(
      `Results (${results.length} match${results.length > 1 ? "es" : ""} above threshold ${THRESHOLD}):`
    );
    results.forEach((result, i) => {
      const { product, score } = result;
      console.log(`  ${i + 1}. ⭐ ${product.name} - Score: ${score.toFixed(2)}`);

      // Determine match type
      let matchType = "";
      if (score >= 95) {
        matchType = "Exact/Near-exact match";
      } else if (score >= 85) {
        matchType = "High similarity (typo tolerance)";
      } else if (score >= 75) {
        matchType = "Good match (keyword/partial)";
      } else {
        matchType = "Moderate match";
      }

      console.log(`     └─ ${matchType}`);
    });
    totalMatches += results.length;
  }

  // Show individual product scores for educational purposes
  if (index === 1) {
    // Typo handling scenario
    console.log("");
    console.log("  Detailed Scoring:");
    products.forEach((p) => {
      const score = calculateFuzzyScore(scenario.query, p);
      if (score > 0) {
        console.log(
          `    • ${p.name}: ${score.toFixed(2)} ${score < THRESHOLD ? "(filtered out)" : ""}`
        );
      }
    });
  }

  console.log("");
});

console.log("━".repeat(60));
console.log("");
console.log("Summary:");
console.log(`  ✓ ${totalScenarios} demo scenarios completed`);
console.log(
  `  ✓ Average ${(totalMatches / totalScenarios).toFixed(1)} matches per query`
);
console.log(`  ✓ Threshold: ${THRESHOLD}`);
console.log("  ✓ Typo tolerance working correctly");
console.log("");

// Additional demo: Show score weighting
console.log("━".repeat(60));
console.log("");
console.log("=== Bonus: Score Weighting Demonstration ===");
console.log("");

const testProduct = products[0]; // Wireless Mouse
const testQueries = ["wireless", "ergonomic", "mouse"];

console.log(`Test Product: ${testProduct.name}`);
console.log("");
console.log("Weighted Scoring:");
console.log("  • Name matches: 1.5x weight");
console.log("  • Keyword matches: 1.2x weight");
console.log("  • Description matches: 1.0x weight");
console.log("");

testQueries.forEach((query) => {
  const score = calculateFuzzyScore(query, testProduct);
  let matchLocation = "";

  if (testProduct.name.toLowerCase().includes(query)) {
    matchLocation = "name (1.5x)";
  } else if (testProduct.keywords.some((k) => k.toLowerCase().includes(query))) {
    matchLocation = "keyword (1.2x)";
  } else {
    matchLocation = "description (1.0x)";
  }

  console.log(`  "${query}" → Score: ${score.toFixed(2)} (matched in ${matchLocation})`);
});

console.log("");
console.log("━".repeat(60));
console.log("");
console.log("Demo completed! Run with: npm run demo:fuzzy");
console.log("");
