# Testing Documentation for Fuzzy Search Feature

This document provides comprehensive information about the test suite for the fuzzy search functionality.

## Table of Contents
- [Overview](#overview)
- [Test Files](#test-files)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Test Structure](#test-structure)

## Overview

The fuzzy search feature includes comprehensive test coverage for:
- **Backend**: Fuzzy search helper functions and algorithms
- **Frontend**: React components for search functionality
- **Integration**: End-to-end user workflows

## Test Files

### Backend Tests

#### 1. `tests/fuzzySearch.test.js`
Tests for the fuzzy search helper functions.

**Test Suites:**
- `normalizeSearchTerm()` - Text normalization
- `calculateFuzzyScore()` - Fuzzy matching score calculation
- `fuzzyMatchProducts()` - Product fuzzy matching

**Coverage:**
- ✅ Text normalization (lowercase, trim, special characters)
- ✅ Score calculation with weighted fields (name, description, keywords)
- ✅ Typo handling ("telefone" → "telephone")
- ✅ Threshold filtering (default 70%)
- ✅ Edge cases (empty strings, short terms, special characters)
- ✅ Multi-word queries
- ✅ Case-insensitive matching

### Frontend Tests

#### 2. `client/src/pages/Search.test.js`
Tests for the Search results page component.

**Test Suites:**
- Rendering - Component display and layout
- Product Display - Product cards, fuzzy match badges
- More Details Button - Navigation functionality
- Add to Cart Button - Cart operations
- Fuzzy Search Integration - Exact vs fuzzy match display
- Edge Cases - Error handling

**Coverage:**
- ✅ Display search results with product count
- ✅ Show "Similar match" badge for fuzzy matched products
- ✅ Navigate to product details page on "More Details" click
- ✅ Add products to cart with toast notifications
- ✅ Handle missing product data gracefully
- ✅ Product image loading with fallback

#### 3. `client/src/components/Form/SearchInput.test.js`
Tests for the SearchInput component with clear button.

**Test Suites:**
- Rendering - Input field and buttons
- Input Handling - Typing and clearing
- Search Functionality - API calls and navigation
- Clear Button Functionality - Reset input and results
- Fuzzy Search Integration - Typo handling
- Edge Cases - Empty searches, long queries, special characters

**Coverage:**
- ✅ Render search input and buttons
- ✅ Show/hide clear button based on input
- ✅ Call search API with correct endpoint
- ✅ Navigate to /search page after search
- ✅ Clear input and results on clear button click
- ✅ Handle API errors gracefully
- ✅ Support Enter key submission

## Setup

### Backend Setup

1. **Install Jest dependencies:**
   ```bash
   npm install --save-dev jest @jest/globals
   ```

2. **Jest is already configured** in `jest.config.js` with:
   - ES modules support
   - Node environment
   - Coverage thresholds (70%)

### Frontend Setup

Frontend testing is already configured via Create React App with:
- Jest
- React Testing Library
- No additional setup needed

## Running Tests

### Backend Tests

#### Run all backend tests:
```bash
npm test
```

#### Run tests in watch mode (auto-rerun on changes):
```bash
npm run test:watch
```

#### Run tests with coverage report:
```bash
npm run test:coverage
```

#### Run specific test file:
```bash
npm test -- tests/fuzzySearch.test.js
```

### Frontend Tests

#### Run all frontend tests:
```bash
cd client
npm test
```

#### Run tests in watch mode:
```bash
cd client
npm test -- --watch
```

#### Run tests with coverage:
```bash
cd client
npm test -- --coverage
```

#### Run specific test file:
```bash
cd client
npm test -- Search.test.js
```

### Run All Tests (Backend + Frontend)

Create a script in the root package.json:
```bash
# Add to scripts section:
"test:all": "npm test && cd client && npm test"
```

Then run:
```bash
npm run test:all
```

## Test Coverage

### Coverage Goals

**Backend:**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

**Frontend:**
- Standard Create React App coverage thresholds

### Current Coverage Areas

#### Backend - Fuzzy Search Helper
- ✅ 100% coverage of `normalizeSearchTerm()`
- ✅ 100% coverage of `calculateFuzzyScore()`
- ✅ 100% coverage of `fuzzyMatchProducts()`
- ✅ Edge cases: short terms, empty inputs, special characters
- ✅ Scoring algorithm: exact matches, partial matches, typos

#### Frontend - Search Components
- ✅ Search.js component rendering and interactions
- ✅ SearchInput.js component with clear button
- ✅ Navigation to product details
- ✅ Add to cart functionality
- ✅ Fuzzy match badge display
- ✅ API integration and error handling

### Viewing Coverage Reports

After running `npm run test:coverage`:

**Backend:**
```bash
# Coverage report location:
coverage/lcov-report/index.html
```

**Frontend:**
```bash
# Coverage report location:
client/coverage/lcov-report/index.html
```

Open these HTML files in a browser to view detailed coverage reports.

## Test Structure

### Test Organization

```
clz/
├── tests/                          # Backend tests
│   └── fuzzySearch.test.js        # Fuzzy search helper tests
├── client/src/
│   ├── pages/
│   │   └── Search.test.js         # Search page tests
│   └── components/Form/
│       └── SearchInput.test.js    # Search input tests
├── jest.config.js                 # Backend Jest config
└── docs/
    └── TESTING.md                 # This file
```

### Test Naming Conventions

**Test Files:**
- `*.test.js` - Test files
- `*.spec.js` - Specification files (alternative)

**Test Suites:**
- `describe("Component/Function Name", ...)` - Main test suite
- Nested `describe()` for grouping related tests

**Test Cases:**
- `it("should do something", ...)` - Individual test cases
- Use clear, descriptive test names

### Mocking Strategy

**Backend:**
- No external API calls in current fuzzy search tests
- Pure function testing

**Frontend:**
- Mock `axios` for API calls
- Mock `react-router-dom` for navigation
- Mock `react-hot-toast` for notifications
- Mock child components (Layout) for isolation

## Test Examples

### Backend Test Example

```javascript
describe("normalizeSearchTerm", () => {
  it("should convert text to lowercase", () => {
    expect(normalizeSearchTerm("HELLO")).toBe("hello");
  });

  it("should trim whitespace", () => {
    expect(normalizeSearchTerm("  hello  ")).toBe("hello");
  });
});
```

### Frontend Test Example

```javascript
it("should navigate to product details when clicked", () => {
  renderWithProviders({ keyword: "test", results: [mockProduct] });
  const button = screen.getByText("More Details");

  fireEvent.click(button);

  expect(mockedNavigate).toHaveBeenCalledWith("/product/wireless-mouse");
});
```

## Writing New Tests

### Adding Backend Tests

1. Create test file in `tests/` directory
2. Import functions to test
3. Use `describe()` and `it()` blocks
4. Follow existing patterns in `fuzzySearch.test.js`

### Adding Frontend Tests

1. Create `*.test.js` next to component file
2. Import `@testing-library/react` utilities
3. Mock external dependencies
4. Follow existing patterns in `Search.test.js`

## CI/CD Integration

To integrate with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Backend Tests
  run: npm test

- name: Run Frontend Tests
  run: cd client && npm test -- --coverage --watchAll=false

- name: Upload Coverage
  run: npm run test:coverage
```

## Troubleshooting

### Common Issues

**Issue:** `Cannot use import statement outside a module`
**Solution:** Ensure `NODE_OPTIONS=--experimental-vm-modules` is in test script

**Issue:** Frontend tests fail with "Cannot find module"
**Solution:** Check import paths and ensure mocks are set up correctly

**Issue:** "ReferenceError: regeneratorRuntime is not defined"
**Solution:** Add `@babel/preset-env` to babel config (if needed)

### Debug Mode

Run tests with debugging:
```bash
# Backend
node --inspect-brk node_modules/.bin/jest --runInBand

# Frontend
cd client
npm test -- --no-cache
```

## Best Practices

1. **Write tests first** - Consider TDD approach
2. **Keep tests isolated** - Each test should be independent
3. **Use descriptive names** - Test names should explain what they test
4. **Mock external dependencies** - Avoid real API calls in tests
5. **Test edge cases** - Empty inputs, null values, extreme cases
6. **Maintain coverage** - Aim for >70% coverage
7. **Update tests with code changes** - Keep tests in sync

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Summary

The fuzzy search test suite provides comprehensive coverage of:
- ✅ Fuzzy matching algorithms (Levenshtein distance)
- ✅ Search functionality (exact + fuzzy matches)
- ✅ User interface components
- ✅ Navigation and cart operations
- ✅ Edge cases and error handling

Run tests regularly to ensure the fuzzy search feature works correctly and catch regressions early!
