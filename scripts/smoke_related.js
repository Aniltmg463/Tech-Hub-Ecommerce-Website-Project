import { jaccardDetailed } from "../helpers/jaccard.js";

// Simple smoke test for similarity-based sorting (without DB)
const current = {
  _id: "p0",
  name: "Red sports running shoes",
  description: "Lightweight breathable running shoes for men",
};

const candidates = [
  {
    _id: "p1",
    name: "Blue running shoes",
    description: "Comfortable running shoes with cushioning",
  },
  {
    _id: "p2",
    name: "Red sports shoes",
    description: "Sports shoes, lightweight and breathable",
  },
  {
    _id: "p3",
    name: "Leather formal shoes",
    description: "Elegant leather shoes for formal wear",
  },
  {
    _id: "p4",
    name: "Running socks",
    description: "Breathable socks for running",
  },
];

const baseText = `${current.name} ${current.description}`;
const scored = candidates
  .map((p) => {
    const targetText = `${p.name} ${p.description}`;
    const det = jaccardDetailed(baseText, targetText);
    return { product: p, score: det.score, details: det };
  })
  .sort((a, b) => b.score - a.score);

console.log("Similarity scores (descending):");
for (const s of scored) {
  console.log(s.product._id, s.product.name, "->", s.score);
}
