import { jaccard, jaccardDetailed } from "../helpers/jaccard.js";

// Sample products with keywords for demonstration
const products = [
  {
    id: "product-1",
    name: "Wireless Mouse",
    keywords: ["mouse", "wireless", "computer", "accessory", "ergonomic"],
  },
  {
    id: "product-2",
    name: "Gaming Keyboard",
    keywords: ["keyboard", "gaming", "mechanical", "RGB", "computer"],
  },
  {
    id: "product-3",
    name: "Telephone",
    keywords: ["telephone", "phone", "desk", "office", "communication"],
  },
  {
    id: "product-4",
    name: "Gaming Laptop",
    keywords: ["laptop", "gaming", "computer", "portable", "high-performance"],
  },
  {
    id: "product-5",
    name: "USB Cable",
    keywords: ["cable", "USB", "charging", "accessory", "USB-C"],
  },
  {
    id: "product-6",
    name: "Monitor Display",
    keywords: ["monitor", "display", "screen", "4K", "LED"],
  },
  {
    id: "product-7",
    name: "Smartphone",
    keywords: ["smartphone", "phone", "mobile", "5G", "camera"],
  },
  {
    id: "product-8",
    name: "Wireless Headphones",
    keywords: ["headphones", "wireless", "audio", "noise-canceling", "music"],
  },
];

// Demo scenarios for Jaccard similarity
const scenarios = [
  {
    name: "High Similarity - Same Category",
    productA: products[0], // Wireless Mouse
    productB: products[7], // Wireless Headphones
    description: "Both are wireless accessories",
  },
  {
    name: "Moderate Similarity - Shared Keywords",
    productA: products[1], // Gaming Keyboard
    productB: products[3], // Gaming Laptop
    description: "Both are gaming products with 'gaming' and 'computer' keywords",
  },
  {
    name: "Low Similarity - Different Categories",
    productA: products[2], // Telephone
    productB: products[5], // Monitor Display
    description: "Completely different product categories",
  },
  {
    name: "No Similarity - No Common Keywords",
    productA: products[4], // USB Cable
    productB: products[6], // Smartphone
    description: "No shared keywords between products",
  },
  {
    name: "Partial Match - Accessory Category",
    productA: products[0], // Wireless Mouse
    productB: products[4], // USB Cable
    description: "Both are accessories, share 'accessory' keyword",
  },
];

// String-based comparison scenarios
const stringScenarios = [
  {
    name: "String Comparison - Exact Match",
    setA: "wireless mouse computer",
    setB: "wireless mouse computer",
    description: "Identical strings should have Jaccard = 1.0",
  },
  {
    name: "String Comparison - Partial Overlap",
    setA: "gaming keyboard mechanical RGB",
    setB: "gaming laptop computer portable",
    description: "Shared 'gaming' keyword, different other terms",
  },
  {
    name: "String Comparison - No Overlap",
    setA: "telephone office desk",
    setB: "monitor display screen",
    description: "Completely different terms",
  },
  {
    name: "String Comparison - Case Insensitive",
    setA: "WIRELESS MOUSE",
    setB: "wireless mouse",
    description: "Jaccard handles case insensitivity",
  },
];

// Edge case scenarios
const edgeCases = [
  {
    name: "Empty Sets",
    setA: [],
    setB: [],
    description: "Both sets empty",
  },
  {
    name: "One Empty Set",
    setA: ["mouse", "wireless"],
    setB: [],
    description: "One set empty, one populated",
  },
  {
    name: "Identical Arrays",
    setA: ["gaming", "computer", "laptop"],
    setB: ["gaming", "computer", "laptop"],
    description: "Identical arrays should have Jaccard = 1.0",
  },
  {
    name: "Subset Relationship",
    setA: ["gaming", "computer"],
    setB: ["gaming", "computer", "laptop", "portable"],
    description: "Set A is subset of Set B",
  },
];

console.log("╔════════════════════════════════════════════════════════╗");
console.log("║       Jaccard Similarity Demonstration Script       ║");
console.log("║  Testing keyword-based similarity calculations       ║");
console.log("╚════════════════════════════════════════════════════════╝");
console.log("");

console.log(`Sample Products (${products.length} total):`);
products.forEach((p) => {
  console.log(`  • ${p.name}: [${p.keywords.join(", ")}]`);
});
console.log("");

// ============================================
// Scenario 1: Product-to-Product Comparisons
// ============================================
console.log("━".repeat(60));
console.log("");
console.log("=== PART 1: Product-to-Product Keyword Comparisons ===");
console.log("");

scenarios.forEach((scenario, index) => {
  console.log("━".repeat(60));
  console.log("");
  console.log(`Scenario ${index + 1}: ${scenario.name}`);
  console.log(`Description: ${scenario.description}`);
  console.log("");
  console.log(`Product A: ${scenario.productA.name}`);
  console.log(`  Keywords: [${scenario.productA.keywords.join(", ")}]`);
  console.log(`Product B: ${scenario.productB.name}`);
  console.log(`  Keywords: [${scenario.productB.keywords.join(", ")}]`);
  console.log("");

  // Calculate Jaccard similarity
  const result = jaccardDetailed(
    scenario.productA.keywords,
    scenario.productB.keywords
  );

  console.log(`Jaccard Similarity Score: ${result.score.toFixed(4)}`);
  console.log(`  (Range: 0.0 = no similarity, 1.0 = identical)`);
  console.log("");
  console.log(`Intersection (${result.intersection.length} common keywords):`);
  if (result.intersection.length > 0) {
    result.intersection.forEach((keyword) => {
      console.log(`  ✓ "${keyword}"`);
    });
  } else {
    console.log(`  (none)`);
  }
  console.log("");
  console.log(`Union (${result.union.length} unique keywords total):`);
  console.log(`  [${result.union.join(", ")}]`);
  console.log("");
  console.log(
    `Formula: |A ∩ B| / |A ∪ B| = ${result.intersection.length} / ${result.union.length} = ${result.score.toFixed(4)}`
  );
  console.log("");

  // Interpretation
  let interpretation = "";
  if (result.score >= 0.7) {
    interpretation = "🔴 Very High Similarity - Strong recommendation match";
  } else if (result.score >= 0.4) {
    interpretation = "🟡 Moderate Similarity - Good recommendation candidate";
  } else if (result.score >= 0.2) {
    interpretation = "🟢 Low Similarity - Weak match";
  } else {
    interpretation = "⚪ Very Low/No Similarity - Not recommended";
  }
  console.log(`Interpretation: ${interpretation}`);
  console.log("");
});

// ============================================
// Scenario 2: String-based Comparisons
// ============================================
console.log("━".repeat(60));
console.log("");
console.log("=== PART 2: String-based Jaccard Comparisons ===");
console.log("");

stringScenarios.forEach((scenario, index) => {
  console.log("━".repeat(60));
  console.log("");
  console.log(`Scenario ${index + 1}: ${scenario.name}`);
  console.log(`Description: ${scenario.description}`);
  console.log("");
  console.log(`Set A: "${scenario.setA}"`);
  console.log(`Set B: "${scenario.setB}"`);
  console.log("");

  const result = jaccardDetailed(scenario.setA, scenario.setB);

  console.log(`Jaccard Score: ${result.score.toFixed(4)}`);
  console.log(`Intersection: [${result.intersection.join(", ")}]`);
  console.log(`Union: [${result.union.join(", ")}]`);
  console.log("");
});

// ============================================
// Scenario 3: Edge Cases
// ============================================
console.log("━".repeat(60));
console.log("");
console.log("=== PART 3: Edge Cases and Special Scenarios ===");
console.log("");

edgeCases.forEach((scenario, index) => {
  console.log("━".repeat(60));
  console.log("");
  console.log(`Edge Case ${index + 1}: ${scenario.name}`);
  console.log(`Description: ${scenario.description}`);
  console.log("");
  console.log(`Set A: [${scenario.setA.join(", ")}]`);
  console.log(`Set B: [${scenario.setB.join(", ")}]`);
  console.log("");

  const result = jaccardDetailed(scenario.setA, scenario.setB);

  console.log(`Jaccard Score: ${result.score.toFixed(4)}`);
  console.log(`Intersection: [${result.intersection.join(", ")}]`);
  console.log(`Union: [${result.union.join(", ")}]`);
  console.log("");
});

// ============================================
// Scenario 4: Product Recommendation Simulation
// ============================================
console.log("━".repeat(60));
console.log("");
console.log("=== PART 4: Product Recommendation Simulation ===");
console.log("");

const currentProduct = products[1]; // Gaming Keyboard
console.log(`Current Product: ${currentProduct.name}`);
console.log(`Keywords: [${currentProduct.keywords.join(", ")}]`);
console.log("");
console.log("Finding similar products based on keyword similarity:");
console.log("");

// Calculate similarity with all other products
const recommendations = products
  .filter((p) => p.id !== currentProduct.id)
  .map((product) => {
    const score = jaccard(currentProduct.keywords, product.keywords);
    return { product, score };
  })
  .sort((a, b) => b.score - a.score); // Sort by score descending

recommendations.forEach((rec, index) => {
  const { product, score } = rec;
  console.log(
    `${index + 1}. ${product.name} - Score: ${score.toFixed(4)} ${score >= 0.3 ? "⭐" : ""}`
  );
  console.log(`   Keywords: [${product.keywords.join(", ")}]`);
  
  const detailed = jaccardDetailed(currentProduct.keywords, product.keywords);
  if (detailed.intersection.length > 0) {
    console.log(`   Common: [${detailed.intersection.join(", ")}]`);
  }
  console.log("");
});

// ============================================
// Summary
// ============================================
console.log("━".repeat(60));
console.log("");
console.log("=== Summary ===");
console.log("");
console.log(`✓ ${scenarios.length} product-to-product comparisons completed`);
console.log(`✓ ${stringScenarios.length} string-based comparisons completed`);
console.log(`✓ ${edgeCases.length} edge cases tested`);
console.log(`✓ Product recommendation simulation completed`);
console.log("");
console.log("Key Insights:");
console.log("  • Jaccard similarity ranges from 0.0 (no similarity) to 1.0 (identical)");
console.log("  • Higher scores indicate more shared keywords");
console.log("  • Useful for product recommendations based on keyword overlap");
console.log("  • Handles both arrays and strings (strings are tokenized)");
console.log("  • Case-insensitive comparison");
console.log("");
console.log("━".repeat(60));
console.log("");
console.log("Demo completed! Run with: npm run demo:jaccard");
console.log("");