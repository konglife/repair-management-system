import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SettingsPage from "./page";

// Mock the tRPC API
jest.mock("~/app/providers", () => {
  const mockApi = {
    settings: {
      getBusinessProfile: {
        useQuery: () => ({
          data: null,
          isLoading: false,
          refetch: jest.fn(),
        }),
      },
      createOrUpdateBusinessProfile: {
        useMutation: () => ({
          mutate: jest.fn(),
          isPending: false,
        }),
      },
    },
  };

  return {
    api: mockApi,
  };
});

describe("Settings Page", () => {
  it("renders settings page with business profile form", () => {
    render(<SettingsPage />);
    
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Business Profile")).toBeInTheDocument();
    expect(screen.getByLabelText(/Shop Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Logo URL/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Low Stock Threshold/)).toBeInTheDocument();
  });

  it("shows validation error for empty shop name", async () => {
    render(<SettingsPage />);
    
    const submitButton = screen.getByRole("button", { name: /Save Business Profile/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText("Shop name is required")).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    render(<SettingsPage />);
    
    const emailInput = screen.getByLabelText(/Contact Email/);
    const shopNameInput = screen.getByLabelText(/Shop Name/);
    
    fireEvent.change(shopNameInput, { target: { value: "Test Shop" } });
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    
    const submitButton = screen.getByRole("button", { name: /Save Business Profile/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    });
  });

  it("validates URL format for logo", async () => {
    render(<SettingsPage />);
    
    const logoUrlInput = screen.getByLabelText(/Company Logo URL/);
    const shopNameInput = screen.getByLabelText(/Shop Name/);
    
    fireEvent.change(shopNameInput, { target: { value: "Test Shop" } });
    fireEvent.change(logoUrlInput, { target: { value: "invalid-url" } });
    
    const submitButton = screen.getByRole("button", { name: /Save Business Profile/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText("Please enter a valid URL")).toBeInTheDocument();
    });
  });
});