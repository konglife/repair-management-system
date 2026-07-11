import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format, startOfMonth } from "date-fns";
import { useRouter } from "next/navigation";
import ReportsPage from "./page";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

/**
 * Open the DatePicker bound to `labelRegex` and click the given day-of-month
 * in its currently displayed month, then dismiss the popover. The reports page
 * defaults both pickers to the current month, so any mid-month day (5/10/20)
 * is unique and avoids react-day-picker's outside-day duplicates.
 */
async function pickDay(
  user: ReturnType<typeof userEvent.setup>,
  labelRegex: RegExp,
  day: number
) {
  await user.click(screen.getByLabelText(labelRegex));
  const cell = await screen.findByRole("gridcell", {
    name: new RegExp(`^${day}$`),
  });
  await user.click(within(cell).getByRole("button"));
  await user.keyboard("{Escape}");
}

describe("ReportsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders the reports page with date pickers defaulting to the current month", () => {
    render(<ReportsPage />);

    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate report/i })
    ).toBeInTheDocument();

    // Default range = start of current month .. today (dd/MM/yyyy display)
    const now = new Date();
    expect(
      screen.getByText(format(startOfMonth(now), "dd/MM/yyyy"))
    ).toBeInTheDocument();
    expect(screen.getByText(format(now, "dd/MM/yyyy"))).toBeInTheDocument();
  });

  it("navigates to the summary page using default current-month range when submitted unchanged", async () => {
    const user = userEvent.setup();
    render(<ReportsPage />);

    await user.click(screen.getByRole("button", { name: /generate report/i }));

    const now = new Date();
    expect(mockPush).toHaveBeenCalledWith(
      `/reports/summary?startDate=${format(
        startOfMonth(now),
        "yyyy-MM-dd"
      )}&endDate=${format(now, "yyyy-MM-dd")}`
    );
  });

  it("serializes picked dates to yyyy-MM-dd query params on valid submission", async () => {
    const user = userEvent.setup();
    render(<ReportsPage />);

    await pickDay(user, /start date/i, 10);
    await pickDay(user, /end date/i, 20);

    await user.click(screen.getByRole("button", { name: /generate report/i }));

    const now = new Date();
    expect(mockPush).toHaveBeenCalledWith(
      `/reports/summary?startDate=${format(
        new Date(now.getFullYear(), now.getMonth(), 10),
        "yyyy-MM-dd"
      )}&endDate=${format(
        new Date(now.getFullYear(), now.getMonth(), 20),
        "yyyy-MM-dd"
      )}`
    );
  });

  it("shows a validation error when start date is after end date", async () => {
    const user = userEvent.setup();
    render(<ReportsPage />);

    await pickDay(user, /start date/i, 20);
    await pickDay(user, /end date/i, 10);

    fireEvent.submit(
      screen.getByRole("button", { name: /generate report/i }).closest("form")!
    );

    await waitFor(() => {
      expect(
        screen.getByText("Start date must be before end date")
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clears the cross-field error when the user picks a new date", async () => {
    const user = userEvent.setup();
    render(<ReportsPage />);

    // Trigger the error: start (20) after end (10)
    await pickDay(user, /start date/i, 20);
    await pickDay(user, /end date/i, 10);
    fireEvent.submit(
      screen.getByRole("button", { name: /generate report/i }).closest("form")!
    );
    await waitFor(() => {
      expect(
        screen.getByText("Start date must be before end date")
      ).toBeInTheDocument();
    });

    // Pick a new start date (5) that is now before end (10)
    await pickDay(user, /start date/i, 5);

    expect(
      screen.queryByText("Start date must be before end date")
    ).not.toBeInTheDocument();
  });
});
