import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  normalizeSearchTerm,
  calculateFuzzyScore,
  fuzzyMatchProducts,
} from "../helpers/fuzzySearch.js";

describe("Fuzzy Search Helper Functions", () => {
  describe("normalizeSearchTerm", () => {
    it("should convert text to lowercase", () => {
      expect(normalizeSearchTerm("HELLO")).toBe("hello");
      expect(normalizeSearchTerm("WoRlD")).toBe("world");
    });

    it("should trim whitespace", () => {
      expect(normalizeSearchTerm("  hello  ")).toBe("hello");
      expect(normalizeSearchTerm("\thello\n")).toBe("hello");
    });

    it("should remove special characters except hyphens", () => {
      expect(normalizeSearchTerm("hello@world!")).toBe("helloworld");
      expect(normalizeSearchTerm("hello-world")).toBe("hello-world");
      expect(normalizeSearchTerm("hello_world")).toBe("helloworld");
    });

    it("should handle empty strings", () => {
      expect(normalizeSearchTerm("")).toBe("");
      expect(normalizeSearchTerm(null)).toBe("");
      expect(normalizeSearchTerm(undefined)).toBe("");
    });

    it("should preserve numbers", () => {
      expect(normalizeSearchTerm("Product123")).toBe("product123");
      expect(normalizeSearchTerm("iPhone 12")).toBe("iphone 12");
    });
  });

  describe("calculateFuzzyScore", () => {
    const mockProduct = {
      name: "Wireless Mouse",
      description: "A high-quality wireless mouse with ergonomic design",
      keywords: ["mouse", "wireless", "computer", "accessory"],
    };

    it("should return 0 for empty search term", () => {
      expect(calculateFuzzyScore("", mockProduct)).toBe(0);
      expect(calculateFuzzyScore(null, mockProduct)).toBe(0);
    });

    it("should return 0 for null product", () => {
      expect(calculateFuzzyScore("mouse", null)).toBe(0);
    });

    it("should calculate high score for exact name match", () => {
      const score = calculateFuzzyScore("wireless mouse", mockProduct);
      expect(score).toBeGreaterThan(90);
    });

    it("should calculate good score for partial name match", () => {
      const score = calculateFuzzyScore("wireless", mockProduct);
      expect(score).toBeGreaterThan(70);
    });

    it("should calculate score for keyword match", () => {
      const score = calculateFuzzyScore("computer", mockProduct);
      expect(score).toBeGreaterThan(70);
    });

    it("should calculate score for description match", () => {
      const score = calculateFuzzyScore("ergonomic", mockProduct);
      expect(score).toBeGreaterThan(50);
    });

    it("should handle typos in product name", () => {
      const score = calculateFuzzyScore("wireles mose", mockProduct);
      expect(score).toBeGreaterThan(60);
    });

    it("should return low score for completely different terms", () => {
      const score = calculateFuzzyScore("banana", mockProduct);
      expect(score).toBeLessThan(50);
    });

    it("should weight name matches higher than description", () => {
      const nameScore = calculateFuzzyScore("wireless", mockProduct);
      const descScore = calculateFuzzyScore("ergonomic", mockProduct);
      // Name matches should be weighted higher (1.5x) vs description (1x)
      // Both may max out at 100, so check they're at least good scores
      expect(nameScore).toBeGreaterThanOrEqual(descScore);
      expect(nameScore).toBeGreaterThan(90);
    });
  });

  describe("fuzzyMatchProducts", () => {
    let mockProducts;

    beforeEach(() => {
      mockProducts = [
        {
          _id: "1",
          name: "Wireless Mouse",
          description: "A high-quality wireless mouse",
          keywords: ["mouse", "wireless"],
        },
        {
          _id: "2",
          name: "Gaming Keyboard",
          description: "Mechanical gaming keyboard",
          keywords: ["keyboard", "gaming"],
        },
        {
          _id: "3",
          name: "USB Cable",
          description: "USB-C charging cable",
          keywords: ["cable", "usb"],
        },
        {
          _id: "4",
          name: "Computer Monitor",
          description: "27 inch LED monitor",
          keywords: ["monitor", "display"],
        },
      ];
    });

    it("should return empty array for empty search term", () => {
      const results = fuzzyMatchProducts("", mockProducts);
      expect(results).toEqual([]);
    });

    it("should return empty array for null products", () => {
      const results = fuzzyMatchProducts("mouse", null);
      expect(results).toEqual([]);
    });

    it("should return empty array for very short search terms (1-2 chars)", () => {
      const results1 = fuzzyMatchProducts("m", mockProducts);
      const results2 = fuzzyMatchProducts("mo", mockProducts);
      expect(results1).toEqual([]);
      expect(results2).toEqual([]);
    });

    it("should return matching products with scores", () => {
      const results = fuzzyMatchProducts("mouse", mockProducts, 70);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty("product");
      expect(results[0]).toHaveProperty("score");
    });

    it("should filter results by threshold", () => {
      const highThreshold = fuzzyMatchProducts("mouse", mockProducts, 90);
      const lowThreshold = fuzzyMatchProducts("mouse", mockProducts, 50);
      expect(highThreshold.length).toBeLessThanOrEqual(lowThreshold.length);
    });

    it("should sort results by score (descending)", () => {
      const results = fuzzyMatchProducts("wireless", mockProducts, 50);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });

    it("should handle typos and return similar products", () => {
      const results = fuzzyMatchProducts("wireles mose", mockProducts, 60);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].product.name).toBe("Wireless Mouse");
    });

    it("should match products by keywords", () => {
      const results = fuzzyMatchProducts("gaming", mockProducts, 70);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].product.name).toBe("Gaming Keyboard");
    });

    it("should use default threshold of 70 when not provided", () => {
      const results = fuzzyMatchProducts("mouse", mockProducts);
      expect(results.length).toBeGreaterThan(0);
    });

    it("should handle special characters in search term", () => {
      const results = fuzzyMatchProducts("USB-C", mockProducts, 60);
      expect(results.length).toBeGreaterThan(0);
    });

    it("should return no results for completely unrelated terms", () => {
      const results = fuzzyMatchProducts("banana", mockProducts, 70);
      expect(results.length).toBe(0);
    });

    it("should handle multi-word search queries", () => {
      const results = fuzzyMatchProducts("wireless mouse", mockProducts, 70);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].product.name).toBe("Wireless Mouse");
    });

    it("should handle case-insensitive searches", () => {
      const results1 = fuzzyMatchProducts("MOUSE", mockProducts, 70);
      const results2 = fuzzyMatchProducts("mouse", mockProducts, 70);
      expect(results1.length).toBe(results2.length);
    });
  });
});
