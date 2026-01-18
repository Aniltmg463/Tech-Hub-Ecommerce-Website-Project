import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Search from "./Search";
import { SearchProvider } from "../context/search";
import { CartProvider } from "../context/cart";
import toast from "react-hot-toast";

// Mock react-router-dom
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

// Mock react-hot-toast
jest.mock("react-hot-toast");

// Mock Layout component
jest.mock("./../components/Layout/Layout", () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout" data-title={title}>
        {children}
      </div>
    );
  };
});

describe("Search Component", () => {
  const mockProducts = [
    {
      _id: "1",
      name: "Wireless Mouse",
      slug: "wireless-mouse",
      description: "A high-quality wireless mouse with ergonomic design",
      price: 29.99,
      isFuzzyMatch: false,
    },
    {
      _id: "2",
      name: "Gaming Keyboard",
      slug: "gaming-keyboard",
      description: "Mechanical gaming keyboard with RGB lighting",
      price: 79.99,
      isFuzzyMatch: false,
    },
    {
      _id: "3",
      name: "Telephone",
      slug: "telephone",
      description: "Modern desk telephone",
      price: 49.99,
      isFuzzyMatch: true, // Fuzzy matched from "telefone"
    },
  ];

  const renderWithProviders = (initialSearchState = { keyword: "", results: [] }) => {
    const SearchWrapper = ({ children }) => {
      const [values, setValues] = React.useState(initialSearchState);
      return (
        <SearchProvider value={[values, setValues]}>
          <CartProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </CartProvider>
        </SearchProvider>
      );
    };

    return render(
      <SearchWrapper>
        <Search />
      </SearchWrapper>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedNavigate.mockClear();
    toast.success = jest.fn();
    toast.error = jest.fn();
  });

  describe("Rendering", () => {
    it("should render search results page", () => {
      renderWithProviders();
      expect(screen.getByText("Search Results")).toBeInTheDocument();
    });

    it("should display 'No product Found' when no results", () => {
      renderWithProviders({ keyword: "test", results: [] });
      expect(screen.getByText("No product Found")).toBeInTheDocument();
    });

    it("should display product count when results exist", () => {
      renderWithProviders({ keyword: "mouse", results: mockProducts });
      expect(screen.getByText(`Found ${mockProducts.length}`)).toBeInTheDocument();
    });

    it("should render all products in results", () => {
      renderWithProviders({ keyword: "mouse", results: mockProducts });
      mockProducts.forEach((product) => {
        expect(screen.getByText(product.name)).toBeInTheDocument();
      });
    });
  });

  describe("Product Display", () => {
    it("should display product name, description, and price", () => {
      renderWithProviders({ keyword: "mouse", results: [mockProducts[0]] });
      const product = mockProducts[0];

      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(/A high-quality wireless mouse/)).toBeInTheDocument();
      expect(screen.getByText(`$ ${product.price}`)).toBeInTheDocument();
    });

    it("should truncate long descriptions to 30 characters", () => {
      const longDescProduct = {
        ...mockProducts[0],
        description: "This is a very long description that should be truncated to 30 characters",
      };
      renderWithProviders({ keyword: "test", results: [longDescProduct] });

      expect(screen.getByText(/This is a very long description.../)).toBeInTheDocument();
    });

    it("should display fuzzy match badge for fuzzy matched products", () => {
      renderWithProviders({ keyword: "telefone", results: [mockProducts[2]] });
      expect(screen.getByText("Similar match")).toBeInTheDocument();
    });

    it("should not display fuzzy match badge for exact matches", () => {
      renderWithProviders({ keyword: "mouse", results: [mockProducts[0]] });
      expect(screen.queryByText("Similar match")).not.toBeInTheDocument();
    });
  });

  describe("More Details Button", () => {
    it("should render More Details button for each product", () => {
      renderWithProviders({ keyword: "test", results: mockProducts });
      const buttons = screen.getAllByText("More Details");
      expect(buttons).toHaveLength(mockProducts.length);
    });

    it("should navigate to product details page when clicked", () => {
      renderWithProviders({ keyword: "test", results: [mockProducts[0]] });
      const button = screen.getByText("More Details");

      fireEvent.click(button);

      expect(mockedNavigate).toHaveBeenCalledWith("/product/wireless-mouse");
    });

    it("should use product ID as fallback when slug is missing", () => {
      const productWithoutSlug = { ...mockProducts[0], slug: undefined };
      renderWithProviders({ keyword: "test", results: [productWithoutSlug] });
      const button = screen.getByText("More Details");

      fireEvent.click(button);

      expect(mockedNavigate).toHaveBeenCalledWith("/product/1");
    });

    it("should show error toast when product has no valid slug or ID", () => {
      const invalidProduct = { ...mockProducts[0], slug: "undefined", _id: "undefined" };
      renderWithProviders({ keyword: "test", results: [invalidProduct] });
      const button = screen.getByText("More Details");

      fireEvent.click(button);

      expect(toast.error).toHaveBeenCalledWith("Cannot navigate: Product details unavailable");
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Add to Cart Button", () => {
    it("should render Add to Cart button for each product", () => {
      renderWithProviders({ keyword: "test", results: mockProducts });
      const buttons = screen.getAllByText("Add to Cart");
      expect(buttons).toHaveLength(mockProducts.length);
    });

    it("should add product to cart when clicked", () => {
      const { container } = renderWithProviders({ keyword: "test", results: [mockProducts[0]] });
      const button = screen.getByText("Add to Cart");

      fireEvent.click(button);

      expect(toast.success).toHaveBeenCalledWith("Item Added to Cart");
    });

    it("should save cart to localStorage when adding product", () => {
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn(),
      };
      global.localStorage = localStorageMock;

      renderWithProviders({ keyword: "test", results: [mockProducts[0]] });
      const button = screen.getByText("Add to Cart");

      fireEvent.click(button);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "cart",
        expect.stringContaining(mockProducts[0]._id)
      );
    });
  });

  describe("Product Images", () => {
    it("should display product images with correct API endpoint", () => {
      renderWithProviders({ keyword: "test", results: [mockProducts[0]] });
      const image = screen.getByAltText(mockProducts[0].name);

      expect(image).toHaveAttribute(
        "src",
        expect.stringContaining(`/api/v1/product/product-photo/${mockProducts[0]._id}`)
      );
    });

    it("should have error handler for broken images", () => {
      renderWithProviders({ keyword: "test", results: [mockProducts[0]] });
      const image = screen.getByAltText(mockProducts[0].name);

      expect(image).toHaveAttribute("onError");
    });
  });

  describe("Fuzzy Search Integration", () => {
    it("should display fuzzy matched products with badge", () => {
      const fuzzyResults = mockProducts.filter((p) => p.isFuzzyMatch);
      renderWithProviders({ keyword: "telefone", results: fuzzyResults });

      expect(screen.getByText("Telephone")).toBeInTheDocument();
      expect(screen.getByText("Similar match")).toBeInTheDocument();
    });

    it("should display both exact and fuzzy matches together", () => {
      renderWithProviders({ keyword: "test", results: mockProducts });

      // Check exact matches (no badge)
      expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();

      // Check fuzzy matches (with badge)
      expect(screen.getByText("Telephone")).toBeInTheDocument();
      expect(screen.getByText("Similar match")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle products with missing description", () => {
      const productWithoutDesc = { ...mockProducts[0], description: "" };
      renderWithProviders({ keyword: "test", results: [productWithoutDesc] });

      expect(screen.getByText(productWithoutDesc.name)).toBeInTheDocument();
    });

    it("should handle products with missing price", () => {
      const productWithoutPrice = { ...mockProducts[0], price: undefined };
      renderWithProviders({ keyword: "test", results: [productWithoutPrice] });

      expect(screen.getByText(productWithoutPrice.name)).toBeInTheDocument();
    });

    it("should handle empty results array", () => {
      renderWithProviders({ keyword: "test", results: [] });

      expect(screen.getByText("No product Found")).toBeInTheDocument();
      expect(screen.queryByText("More Details")).not.toBeInTheDocument();
    });
  });
});
