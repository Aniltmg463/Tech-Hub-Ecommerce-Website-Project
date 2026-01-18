# Database Schema Diagram - Usage Guide

This document explains how to view and use the PlantUML database schema diagram for the TechHub E-Commerce system.

## Files

- **DATABASE_SCHEMA.puml** - PlantUML source file for the database schema diagram

## Viewing the Diagram

### Option 1: VS Code (Recommended)

1. **Install PlantUML Extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "PlantUML" by jebbs
   - Click Install

2. **Install Java** (required by PlantUML)
   - Download from: https://www.java.com/download/
   - Install and restart VS Code

3. **View the Diagram**
   - Open `DATABASE_SCHEMA.puml` in VS Code
   - Press `Alt+D` to preview the diagram
   - Or right-click → "Preview Current Diagram"

### Option 2: Online PlantUML Editor

1. Go to http://www.plantuml.com/plantuml/uml/
2. Copy the contents of `DATABASE_SCHEMA.puml`
3. Paste into the editor
4. The diagram will render automatically

### Option 3: PlantUML Server (Local)

```bash
# Using Docker
docker run -d -p 8080:8080 plantuml/plantuml-server:jetty

# Then open: http://localhost:8080
# Paste the .puml content
```

### Option 4: Command Line Export

```bash
# Install PlantUML
# Download from: https://plantuml.com/download

# Generate PNG
java -jar plantuml.jar DATABASE_SCHEMA.puml

# Generate SVG (scalable)
java -jar plantuml.jar -tsvg DATABASE_SCHEMA.puml

# Generate PDF
java -jar plantuml.jar -tpdf DATABASE_SCHEMA.puml
```

## Database Schema Overview

### Tables

1. **Users**
   - Stores customer and admin accounts
   - Primary Key: `user_id`
   - Includes authentication fields (email, password, answer)
   - Role-based access control (0=user, 1=admin)

2. **Categories**
   - Product categories/classifications
   - Primary Key: `category_id`
   - Unique name and slug for SEO-friendly URLs

3. **Products**
   - Product catalog
   - Primary Key: `product_id`
   - Foreign Key: `category_id` → Categories
   - **keywords** array used for Jaccard similarity algorithm
   - Photo stored as binary data (Buffer)

4. **Orders**
   - Customer purchase orders
   - Primary Key: `order_id`
   - Foreign Key: `buyer_id` → Users
   - Payment object stores transaction details
   - Status enum tracks order lifecycle

5. **OrderLine** (Junction Table)
   - Resolves many-to-many relationship between Orders and Products
   - Primary Key: `order_line_id`
   - Foreign Keys: `order_id` → Orders, `product_id` → Products
   - Stores quantity and price at time of purchase

### Relationships

```
Users (1) ──────< (∞) Orders
  One user can place many orders

Categories (1) ──────< (∞) Products
  One category contains many products

Orders (∞) ──────< (∞) Products
  Many-to-many via OrderLine junction table
  One order contains multiple products
  One product can be in multiple orders
```

### Jaccard Algorithm Implementation

**Purpose:** Generate intelligent product recommendations

**How it works:**
1. Each product has a `keywords` array (auto-generated from name/description)
2. When viewing a product, the system compares its keywords with other products
3. Jaccard similarity coefficient is calculated:
   ```
   J(A,B) = |A ∩ B| / |A ∪ B|

   Where:
   - A = Keywords of current product
   - B = Keywords of comparison product
   - ∩ = Intersection (common keywords)
   - ∪ = Union (all unique keywords)
   ```
4. Products with highest similarity scores are shown as "Related Products"

**Example:**
```javascript
Product A keywords: ["laptop", "gaming", "rgb", "high-performance"]
Product B keywords: ["laptop", "business", "lightweight", "portable"]
Product C keywords: ["laptop", "gaming", "high-performance", "rgb"]

Jaccard(A, B) = 1/7 = 0.14 (low similarity)
Jaccard(A, C) = 4/4 = 1.00 (identical)
```

## Data Types Reference

| Type | Description | MongoDB Type |
|------|-------------|--------------|
| ObjectId | Unique identifier | ObjectId |
| String | Text data | String |
| Integer | Whole numbers | Number |
| Number | Decimal numbers | Number |
| Boolean | True/false | Boolean |
| Buffer | Binary data (images) | Buffer |
| Array<String> | Array of strings | Array |
| Object | Nested document | Object |
| DateTime | Timestamp | Date |
| Enum | Fixed set of values | String |

## Modifying the Diagram

To update the diagram:

1. Open `DATABASE_SCHEMA.puml`
2. Edit the PlantUML syntax
3. Save the file
4. Refresh preview (if using VS Code)

### Common Modifications

**Add a new column:**
```plantuml
entity "TableName" as table {
    PRIMARY_KEY(id) : ObjectId
    --
    COLUMN(new_field) : String
}
```

**Add a relationship:**
```plantuml
table1 ||--o{ table2 : "relationship name"
```

**Add a note:**
```plantuml
note right of table
  Your note here
end note
```

## Exporting for Documentation

**For presentations:** Export as PNG or SVG
```bash
java -jar plantuml.jar -tsvg DATABASE_SCHEMA.puml
```

**For web documentation:** Use SVG (scalable, searchable)

**For print:** Use PDF
```bash
java -jar plantuml.jar -tpdf DATABASE_SCHEMA.puml
```

## Additional Resources

- PlantUML Official Docs: https://plantuml.com/
- PlantUML Class Diagram: https://plantuml.com/class-diagram
- Entity Relationship Diagrams: https://plantuml.com/ie-diagram
- Online Editor: http://www.plantuml.com/plantuml/

## Integration with Project Documentation

This diagram complements:
- `PROJECT_STRUCTURE.md` - Shows code organization
- `README.md` - Project overview and setup
- `JACCARD_TESTING.md` - Jaccard algorithm testing guide
- Model files in `/models/` - Mongoose schema definitions

---

**Last Updated:** 2025-11-23
