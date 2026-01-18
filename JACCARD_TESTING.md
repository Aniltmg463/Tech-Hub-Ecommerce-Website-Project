# Jaccard Similarity Testing Guide

This document provides comprehensive instructions for testing the Jaccard similarity algorithm implementation used for product recommendations in the Tech-Hub application.

## Overview

The Jaccard similarity algorithm measures the similarity between two sets by calculating the ratio of their intersection to their union. In this application, it's used to recommend similar products based on their names and descriptions.

**Formula:** `Jaccard(A, B) = |A ∩ B| / |A ∪ B|`

**Score Range:** 0.0 (no similarity) to 1.0 (identical)

---

## Test Scripts Available

### 1. Basic Unit Tests (`test_jaccard.js`)

Tests the core Jaccard functions with various input types.

**Run:**
```powershell
node "d:\7sem\intern\day28 push on 05-03-2025\clz\scripts\test_jaccard.js"
```

**Expected Output:**
```
Running jaccard tests...
jaccard([1,2,3],[2,3,4]) = 0.5
jaccard('the quick brown fox','quick brown dog') = 0.4
detailed: {
  score: 0.4,
  intersection: [ 'quick', 'brown' ],
  union: [ 'the', 'quick', 'brown', 'fox', 'dog' ]
}
All tests ran (check assertions for failures).
```

**What it tests:**
- Array input similarity
- String tokenization and similarity
- Detailed output with intersection/union data
- Edge cases (empty arrays)

---

### 2. Watch Recommendation Demo (`watch_recommendation_demo.js`)

Demonstrates similarity scoring with keyword-based watch products.

**Run:**
```powershell
node "d:\7sem\intern\day28 push on 05-03-2025\clz\scripts\watch_recommendation_demo.js"
```

**Expected Output:**
```
Similarity to Watch 1 (descending):
Watch 4: score=0.67 | common={analog, leather, black, water-resistant} | total unique=6
Watch 3: score=0.43 | common={analog, leather, classic} | total unique=7
Watch 5: score=0.43 | common={analog, classic, water-resistant} | total unique=7
Watch 2: score=0.25 | common={black, water-resistant} | total unique=8

Recommendation order:
Watch 4
Watch 3
Watch 5
Watch 2
```

**What it tests:**
- Keyword-based product matching
- Score-based sorting (descending)
- Real-world recommendation scenario

---

### 3. Product Similarity Smoke Test (`smoke_related.js`)

Tests product recommendations with realistic product data (names and descriptions).

**Run:**
```powershell
node "d:\7sem\intern\day28 push on 05-03-2025\clz\scripts\smoke_related.js"
```

**Expected Output:**
```
Similarity scores (descending):
p2 Red sports shoes -> 0.3333333333333333
p4 Running socks -> 0.18181818181818182
p1 Blue running shoes -> 0.16666666666666666
p3 Leather formal shoes -> 0.15384615384615385
```

**What it tests:**
- Text-based product similarity using names and descriptions
- Proper sorting by similarity score
- Controller logic simulation

---

## API Testing

### Prerequisites
1. Start the backend server:
```powershell
npm run server
```

2. Ensure MongoDB is running and contains product data

### Step 1: Get Product and Category IDs

**Fetch all products:**
```powershell
curl http://localhost:8080/api/v1/product/get-product | ConvertFrom-Json
```

**Or fetch a specific product by slug:**
```powershell
curl http://localhost:8080/api/v1/product/get-product/<slug> | ConvertFrom-Json
```

**Extract:** Note the `_id` (product ID) and `category._id` (category ID) from the response.

### Step 2: Test Related Products Endpoint

**Request:**
```powershell
curl "http://localhost:8080/api/v1/product/related-product/<pid>/<cid>" | ConvertFrom-Json
```

**Expected Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "60a1b2c3d4e5f600000001",
      "name": "Red sports shoes",
      "description": "Lightweight breathable running shoes for men",
      "price": 59.99,
      "slug": "red-sports-shoes",
      "category": { 
        "_id": "5f9d88b6a2c9e700000001", 
        "name": "Shoes" 
      },
      "relatedScore": 0.3333333333333333
    },
    {
      "_id": "60a1b2c3d4e5f600000002",
      "name": "Blue running shoes",
      "description": "Comfortable running shoes with cushioning",
      "price": 49.99,
      "slug": "blue-running-shoes",
      "category": { 
        "_id": "5f9d88b6a2c9e700000001", 
        "name": "Shoes" 
      },
      "relatedScore": 0.18181818181818182
    }
  ]
}
```

**Validation checklist:**
- [ ] HTTP status code is 200
- [ ] `success: true` in response
- [ ] `products` array is present
- [ ] Products are sorted by `relatedScore` (descending)
- [ ] Each product has expected fields (name, description, price, category)
- [ ] No `photo` field (excluded with `.select("-photo")`)
- [ ] Higher scores indicate more similar products

**Empty result (no similar products):**
```json
{
  "success": true,
  "products": []
}
```

---

## Frontend Testing

### Prerequisites
Start both backend and frontend:
```powershell
npm run dev
```

### Manual Browser Testing

1. **Navigate to product details page:**
   ```
   http://localhost:3000/product/<product-slug>
   ```

2. **Open Browser DevTools (F12)**

3. **Check Network Tab:**
   - Look for GET request: `/api/v1/product/related-product/<pid>/<cid>`
   - Inspect response JSON
   - Verify status code is 200

4. **Check Console:**
   - Type: `relatedProducts` (if you add console.log in code)
   - Or inspect React state in DevTools

5. **Visual Verification:**
   - Scroll to "Similar Products" section
   - Verify product cards are displayed
   - Check if products seem relevant
   - Click "More Details" button to test navigation
   - Verify images load (or fallback image appears)

### Expected UI Behavior

**When similar products exist:**
- Displays up to 3 product cards
- Each card shows:
  - Product image
  - Product name
  - Truncated description (max 30 chars)
  - Price
  - "More Details" and "Add to Cart" buttons
- Products are ordered by relevance (highest similarity first)

**When no similar products:**
- Displays message: "NO Similar Product found"

---

## Understanding Similarity Scores

### Score Interpretation

| Score Range | Interpretation | Example |
|-------------|----------------|---------|
| 0.8 - 1.0 | Very High | Nearly identical products |
| 0.5 - 0.8 | High | Strong similarity |
| 0.3 - 0.5 | Moderate | Some common features |
| 0.1 - 0.3 | Low | Few common words |
| 0.0 - 0.1 | Very Low | Minimal/no overlap |

### Example Calculations

**Example 1: High Similarity**
```
Product A: "Red running shoes comfortable"
Product B: "Blue running shoes lightweight"

Tokens A: [red, running, shoes, comfortable]
Tokens B: [blue, running, shoes, lightweight]
Intersection: [running, shoes]
Union: [red, running, shoes, comfortable, blue, lightweight]

Score = 2/6 = 0.33 (33% similar)
```

**Example 2: Low Similarity**
```
Product A: "Red running shoes"
Product B: "Laptop computer"

Tokens A: [red, running, shoes]
Tokens B: [laptop, computer]
Intersection: []
Union: [red, running, shoes, laptop, computer]

Score = 0/5 = 0.0 (0% similar)
```

---

## Manual Testing with Custom Products

Create a test file to verify specific scenarios:

```powershell
@"
import { jaccard, jaccardDetailed } from '../helpers/jaccard.js';

const product1 = 'Red running shoes comfortable breathable';
const product2 = 'Blue running shoes lightweight breathable';
const product3 = 'Formal leather boots elegant';

console.log('Product 1 vs Product 2:');
console.log(jaccardDetailed(product1, product2));

console.log('\nProduct 1 vs Product 3:');
console.log(jaccardDetailed(product1, product3));
"@ | Out-File -FilePath "d:\7sem\intern\day28 push on 05-03-2025\clz\scripts\custom_test.js" -Encoding UTF8

node "d:\7sem\intern\day28 push on 05-03-2025\clz\scripts\custom_test.js"
```

---

## Troubleshooting

### Issue: No similar products returned

**Possible causes:**
1. No other products exist in the same category
2. Product ID or Category ID is invalid
3. Products have very different names/descriptions (low similarity)

**Solution:**
- Verify products exist: `curl http://localhost:8080/api/v1/product/get-product`
- Check category has multiple products
- Add more products with similar keywords

### Issue: Products not sorted by score

**Solution:**
- Check controller implementation includes `.sort((a, b) => b.score - a.score)`
- Verify `relatedScore` field is present in response

### Issue: Import errors in test scripts

**Error:** `SyntaxError: The requested module does not provide an export`

**Solution:**
- Ensure `helpers/jaccard.js` exports `jaccard` and `jaccardDetailed`
- Update imports to use correct export names
- Check file has `.js` extension in import path

### Issue: All scores are 0

**Possible causes:**
1. Product names/descriptions are empty
2. Tokenization issue (no common words)
3. Case sensitivity mismatch

**Solution:**
- Verify products have populated name and description fields
- Check tokenization in `helpers/jaccard.js` (should lowercase tokens)
- Add more descriptive product data

---

## Performance Testing

For large product catalogs, monitor performance:

```javascript
// Add to controller before database query
console.time('relatedProducts');

// Add after sending response
console.timeEnd('relatedProducts');
```

**Expected performance:**
- < 50ms for categories with < 100 products
- < 200ms for categories with < 1000 products

**Optimization strategies:**
- Limit candidate products with additional filters (price range, rating)
- Cache tokenized product data
- Use database indexes on category field
- Consider pre-computed similarity matrices for very large catalogs

---

## Continuous Integration Testing

Add to CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Jaccard Tests
  run: |
    node scripts/test_jaccard.js
    node scripts/smoke_related.js
    node scripts/watch_recommendation_demo.js
```

---

## Additional Resources

- **Helper file:** `helpers/jaccard.js`
- **Controller:** `controllers/productController.js` (see `relatedProductController`)
- **Frontend:** `client/src/pages/ProductDetails.js`
- **API route:** `/api/v1/product/related-product/:pid/:cid`

---

## Summary Checklist

Before deploying to production, verify:

- [ ] All unit tests pass (`test_jaccard.js`)
- [ ] Smoke tests show correct sorting (`smoke_related.js`)
- [ ] API endpoint returns valid JSON with sorted products
- [ ] Frontend displays similar products correctly
- [ ] Empty states handled gracefully
- [ ] Performance is acceptable for your product catalog size
- [ ] Error handling works (invalid IDs, missing products)
- [ ] Scores make sense for your product data

---

**Last Updated:** November 18, 2025  
**Version:** 1.0
