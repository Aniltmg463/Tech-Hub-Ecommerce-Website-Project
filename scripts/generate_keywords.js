import dotenv from "dotenv";
import connectDB from "../config/db.js";
import productModel from "../models/productModel.js";

dotenv.config();

/**
 * Extract meaningful keywords from product name and description
 */
function extractKeywords(name, description) {
  // Combine name and description
  const text = `${name} ${description}`.toLowerCase();
  
  // Common words to filter out (stop words)
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'this', 'these', 'those', 'or', 'but'
  ]);
  
  // Extract words (alphanumeric only)
  const words = text.match(/\b[a-z0-9]+\b/g) || [];
  
  // Filter out stop words and short words, keep unique
  const keywords = [...new Set(
    words.filter(word => 
      word.length > 2 && !stopWords.has(word)
    )
  )];
  
  // Limit to 10-15 most relevant keywords
  return keywords.slice(0, 15);
}

async function generateKeywords() {
  try {
    await connectDB();
    
    // Find products with empty or missing keywords
    const products = await productModel.find({
      $or: [
        { keywords: { $exists: false } },
        { keywords: { $size: 0 } }
      ]
    });
    
    console.log(`Found ${products.length} products without keywords`);
    
    for (const product of products) {
      const keywords = extractKeywords(
        product.name || '',
        product.description || ''
      );
      
      product.keywords = keywords;
      await product.save();
      
      console.log(`✓ ${product.name}: [${keywords.join(', ')}]`);
    }
    
    console.log('\nKeywords generation complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

generateKeywords();