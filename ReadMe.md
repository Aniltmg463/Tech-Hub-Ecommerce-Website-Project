# Tech-hub online Store
Tech-Hub is a modern e-commerce platform offering a seamless shopping experience with a responsive UI, secure authentication, and a powerful backend for efficient product management.
Click Here to visit this site.[upcoming]

Technologies Used
    Backend: Node.js, Express.js
    Database: MongoDB

Steps to Run:
1. Clone the repository

git clone git@github.com:Aniltmg463/Tech-Hub-Ecommerce-Website-Project.git

2. To Run backend

    Install required packages

  npm install
    Run Backend server

  npm run server

Note
    Add the environment variable as

MONGODB_URI= GIVE_YOUR_DATABASE_CONNECTION_LINK

PORT= PORT_NUMBER_TO_RUN_YOUR_BACKEND

To Run Frontend

cd Frontend

    To install required packages

  npm install

    To run project

  npm run start

If you have any feedback, please reach out to me at tmga401@gmail.com

for demo:
npm run demo:watch



claude:
Steps to Implement:

Create the helper file: Save the Jaccard helper as helpers/jaccard.js
Generate keywords:

Save the auto-generate script as scripts/generate_keywords.js
Run: npm run generate:keywords
OR manually add keywords when creating/updating products

Update the controller: Replace your relatedProductController with the fixed version
Test it: Visit a product page and you should see similar products based on keyword similarity!

How It Works:

User views Product A (e.g., "Gaming Keyboard")
System fetches Product A's keywords: ["keyboard", "gaming", "mechanical", "RGB", "computer"]
System finds all products in the same category
For each product, it calculates Jaccard similarity:

Product B keywords: ["laptop", "gaming", "computer", "portable", "high-performance"]
Common: ["gaming", "computer"] → 2 keywords
Total unique: 8 keywords
Score: 2/8 = 0.25

Products are sorted by score (highest first)
Top 3 similar products are returned

This gives you intelligent product recommendations without machine learning!

Demo Script: scripts/test_jaccard2.js

The demonstration script includes comprehensive testing scenarios:

Part 1: Product-to-Product Keyword Comparisons
- High similarity scenarios (same category, shared keywords)
- Moderate similarity (partial keyword overlap)
- Low similarity (different categories)
- No similarity (no common keywords)

Part 2: String-based Jaccard Comparisons
- Exact match scenarios
- Partial overlap
- Case-insensitive comparison
- No overlap scenarios

Part 3: Edge Cases and Special Scenarios
- Empty sets handling
- Identical arrays (score = 1.0)
- Subset relationships
- One empty set scenarios

Part 4: Product Recommendation Simulation
- Real-world recommendation example
- Calculates similarity scores for all products
- Sorts by relevance (highest score first)
- Shows common keywords between products

Run the demo: npm run demo:jaccard

Key Insights:
- Jaccard similarity ranges from 0.0 (no similarity) to 1.0 (identical)
- Higher scores indicate more shared keywords
- Useful for product recommendations based on keyword overlap
- Handles both arrays and strings (strings are tokenized)
- Case-insensitive comparison