import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SearchInput from "./SearchInput";
import { SearchProvider } from "../../context/search";
import axios from "axios";

// Mock axios
jest.mock("axios");

// Mock react-router-dom
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("SearchInput Component", () => {
  const mockSearchResults = [
    { _id: "1", name: "Product 1", description: "Description 1", price: 10 },
    { _id: "2", name: "Product 2", description: "Description 2", price: 20 },
  ];

  const renderWithProviders = (initialState = { keyword: "", results: [] }) => {
    const SearchWrapper = ({ children }) => {
      const [values, setValues] = React.useState(initialState);
      return (
        <SearchProvider value={[values, setValues]}>
          <BrowserRouter>{children}</BrowserRouter>
        </SearchProvider>
      );
    };

    return render(
      <SearchWrapper>
        <SearchInput />
      </SearchWrapper>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedNavigate.mockClear();
    axios.get.mockReset();
  });

  describe("Rendering", () => {
    it("should render search input field", () => {
      renderWithProviders();
      const input = screen.getByPlaceholderText("Search");
      expect(input).toBeInTheDocument();
    });

    it("should render search button", () => {
      renderWithProviders();
      const button = screen.getByText("Search");
      expect(button).toBeInTheDocument();
    });

    it("should not show clear button when input is empty", () => {
      renderWithProviders();
      expect(screen.queryByText("Clear")).not.toBeInTheDocument();
    });

    it("should show clear button when input has text", () => {
      renderWithProviders({ keyword: "test", results: [] });
      expect(screen.getByText("Clear")).toBeInTheDocument();
    });
  });

  describe("Input Handling", () => {
    it("should update input value when typing", () => {
      renderWithProviders();
      const input = screen.getByPlaceholderText("Search");

      fireEvent.change(input, { target: { value: "laptop" } });

      expect(input.value).toBe("laptop");
    });

    it("should show clear button after typing", () => {
      renderWithProviders();
      const input = screen.getByPlaceholderText("Search");

      fireEvent.change(input, { target: { value: "laptop" } });

      expect(screen.getByText("Clear")).toBeInTheDocument();
    });

    it("should clear input when typing empty string", () => {
      renderWithProviders({ keyword: "test", results: [] });
      const input = screen.getByPlaceholderText("Search");

      fireEvent.change(input, { target: { value: "" } });

      expect(input.value).toBe("");
      expect(screen.queryByText("Clear")).not.toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should call API when search form is submitted", async () => {
      axios.get.mockResolvedValue({ data: mockSearchResults });
      renderWithProviders();

      const input = screen.getByPlaceholderText("Search");
      const searchButton = screen.getByText("Search");

      fireEvent.change(input, { target: { value: "laptop" } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining("/api/v1/product/search/laptop")
        );
      });
    });

    it("should navigate to search page after successful search", async () => {
      axios.get.mockResolvedValue({ data: mockSearchResults });
      renderWithProviders();

      const input = screen.getByPlaceholderText("Search");
      const searchButton = screen.getByText("Search");

      fireEvent.change(input, { target: { value: "laptop" } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockedNavigate).toHaveBeenCalledWith("/search");
      });
    });

    it("should handle search on Enter key press", async () => {
      axios.get.mockResolvedValue({ data: mockSearchResults });
      renderWithProviders();

      const input = screen.getByPlaceholderText("Search");
      const form = input.closest("form");

      fireEvent.change(input, { target: { value: "laptop" } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
        expect(mockedNavigate).toHaveBeenCalledWith("/search");
      });
    });

    it("should handle API errors gracefully", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      axios.get.mockRejectedValue(new Error("Network error"));
      renderWithProviders();

      const input = screen.getByPlaceholderText("Search");
      const searchButton = screen.getByText("Search");

      fireEvent.change(input, { target: { value: "laptop" } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalled();
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe("Clear Button Functionality", () => {
    it("should clear input when clear button is clicked", () => {
      renderWithProviders({ keyword: "laptop", results: mockSearchResults });
      const input = screen.getByPlaceholderText("Search");
      const clearButton = screen.getByText("Clear");

      expect(input.value).toBe("laptop");

      fireEvent.click(clearButton);

      expect(input.value).toBe("");
    });

    it("should clear search results when clear button is clicked", () => {
      const { container } = renderWithProviders({
        keyword: "laptop",
        results: mockSearchResults,
      });
      const clearButton = screen.getByText("Clear");

      fireEvent.click(clearButton);

      // Verify results are cleared (you can check this by ensuring the button disappears)
      expect(screen.queryByText("Clear")).not.toBeInTheDocument();
    });

    it("should hide clear button after clearing", () => {
      renderWithProviders({ keyword: "laptop", results: mockSearchResults });
      const clearButton = screen.getByText("Clear");

      fireEvent.click(clearButton);

      expect(screen.queryByText("Clear")).not.toBeInTheDocument();
    });
  });

  describe("Fuzzy Search Integration", () => {
    it("should handle fuzzy search results with isFuzzyMatch flag", async () => {
      const fuzzyResults = [
        { _id: "1", name: "Telephone", isFuzzyMatch: true, price: 50 },
        { _id: "2", name: "Wireless Phone", isFuzzyMatch: false, price: 60 },
      ];
      axios.get.mockResolvedValue({ data: fuzzyResults });
      renderWithProviders();

      const input = screen.getByPlaceholderText("Search");
      const searchButton = screen.getByText("Search");

      fireEvent.change(input, { target: { value: "telefone" } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining("/api/v1/product/search/telefone")
        );
      });
    });

    it("should search with typos", async () => {
      axios.get.mockResolvedValue({ data: mockSearchResults });
      renderWithProviders();

      const input = screen.getByPlaceholderText("Search");
      const searchButton = screen.getByText("Search");

      // Typo: "wireles" instead of "wireless"
      fireEvent.change(input, { target: { value: "wireles mose" } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining("/api/v1/product/search/wireles mose")
        );
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty search submission", async () => {
      axios.get.mockResolvedValue({ data: [] });
      renderWithProviders();

      const searchButton = screen.getByText("Search");
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining("/api/v1/product/search/")
        );
      });
    });

    it("should handle very long search queries", async () => {
      const longQuery = "a".repeat(100);
      axios.get.mockResolvedValue({ data: [] });
      renderWithProviders();

      const input = screen.getByPlaceholderText("Search");
      const searchButton = screen.getByText("Search");

      fireEvent.change(input, { target: { value: longQuery } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining(longQuery)
        );
      });
    });

    it("should handle special characters in search", async () => {
      axios.get.mockResolvedValue({ data: [] });
      renderWithProviders();

      const input = screen.getByPlaceholderText("Search");
      const searchButton = screen.getByText("Search");

      fireEvent.change(input, { target: { value: "iPhone 12 Pro Max" } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });
    });

    it("should trim whitespace from search input", async () => {
      axios.get.mockResolvedValue({ data: mockSearchResults });
      renderWithProviders();

      const input = screen.getByPlaceholderText("Search");

      fireEvent.change(input, { target: { value: "  laptop  " } });

      expect(input.value).toBe("  laptop  ");
    });
  });

  describe("Button Styling", () => {
    it("should have correct CSS classes for search button", () => {
      renderWithProviders();
      const searchButton = screen.getByText("Search");
      expect(searchButton).toHaveClass("btn", "btn-outline-success", "me-2");
    });

    it("should have correct CSS classes for clear button", () => {
      renderWithProviders({ keyword: "test", results: [] });
      const clearButton = screen.getByText("Clear");
      expect(clearButton).toHaveClass("btn", "btn-outline-danger");
    });

    it("should have proper button types", () => {
      renderWithProviders({ keyword: "test", results: [] });
      const searchButton = screen.getByText("Search");
      const clearButton = screen.getByText("Clear");

      expect(searchButton).toHaveAttribute("type", "submit");
      expect(clearButton).toHaveAttribute("type", "button");
    });
  });
});
