import { jaccard, jaccardDetailed } from "../helpers/jaccard.js";

function assertAlmostEqual(a, b, tol = 1e-12) {
  if (Math.abs(a - b) > tol) {
    console.error(`Assertion failed: ${a} != ${b}`);
    process.exitCode = 2;
  }
}

function run() {
  console.log("Running jaccard tests...");

  // arrays
  const a1 = [1, 2, 3];
  const b1 = [2, 3, 4];
  const s1 = jaccard(a1, b1);
  console.log("jaccard([1,2,3],[2,3,4]) =", s1);
  assertAlmostEqual(s1, 2 / 4);

  // identical
  assertAlmostEqual(jaccard([], []), 0);

  // strings
  const t1 = "the quick brown fox";
  const t2 = "quick brown dog";
  const st = jaccard(t1, t2);
  console.log(`jaccard('${t1}','${t2}') =`, st);

  // detailed
  const det = jaccardDetailed(t1, t2);
  console.log("detailed:", det);

  console.log("All tests ran (check assertions for failures).");
}

run();
