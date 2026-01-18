import { jaccardDetailed } from "../helpers/jaccard.js";

// Five watches with keyword sets
const watches = [
  {
    id: "Watch 1",
    keywords: ["analog", "leather", "black", "classic", "water-resistant"],
  },
  {
    id: "Watch 2",
    keywords: ["digital", "sport", "black", "water-resistant", "plastic"],
  },
  {
    id: "Watch 3",
    keywords: ["analog", "leather", "brown", "vintage", "classic"],
  },
  {
    id: "Watch 4",
    keywords: ["analog", "leather", "black", "water-resistant", "luxury"],
  },
  {
    id: "Watch 5",
    keywords: ["analog", "classic", "water-resistant", "metal", "silver"],
  },
];

const target = watches[0]; // Watch 1

const results = watches
  .filter((w) => w.id !== target.id)
  .map((w) => {
    const det = jaccardDetailed(target.keywords, w.keywords);
    return {
      id: w.id,
      score: det.score,
      intersection: det.intersection,
      union: det.union,
    };
  })
  .sort((a, b) => b.score - a.score);

console.log(`Similarity to ${target.id} (descending):`);
for (const r of results) {
  console.log(
    `${r.id}: score=${r.score.toFixed(2)} | common={${r.intersection.join(", ")}} | total unique=${r.union.length}`
  );
}

console.log("\nRecommendation order:");
for (const r of results) {
  console.log(r.id);
}


