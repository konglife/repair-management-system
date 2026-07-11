import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  it("renders a label wired to the trigger button via htmlFor (a11y)", () => {
    render(
      <DatePicker
        id="sale-date"
        label="Date"
        value={undefined}
        onChange={() => {}}
      />
    );

    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("id", "sale-date");
    expect(screen.getByText("Date")).toHaveAttribute("for", "sale-date");
  });

  it("shows the placeholder when no value is set", () => {
    render(
      <DatePicker
        id="d"
        label="Date"
        value={undefined}
        onChange={() => {}}
        placeholder="Choose a day"
      />
    );

    expect(screen.getByText("Choose a day")).toBeInTheDocument();
  });

  it("displays the selected value in hard-wired dd/MM/yyyy format", () => {
    render(
      <DatePicker
        id="d"
        label="Date"
        value={new Date(2026, 6, 11)} // 11 July 2026
        onChange={() => {}}
      />
    );

    expect(screen.getByText("11/07/2026")).toBeInTheDocument();
  });

  it("marks the field required (label asterisk + aria-required)", () => {
    render(
      <DatePicker
        id="d"
        label="Date"
        value={undefined}
        onChange={() => {}}
        required
      />
    );

    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("aria-required", "true");
  });

  it("disables the trigger button when disabled", () => {
    render(
      <DatePicker
        id="d"
        label="Date"
        value={undefined}
        onChange={() => {}}
        disabled
      />
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onChange with the clicked day when a calendar day is selected", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <DatePicker id="d" label="Date" value={undefined} onChange={onChange} />
    );

    // Open the popover
    await user.click(screen.getByRole("button"));

    // Click the 15th of the displayed month (the <button> inside the gridcell)
    const day15 = within(
      screen.getByRole("gridcell", { name: /^15$/ })
    ).getByRole("button");
    await user.click(day15);

    expect(onChange).toHaveBeenCalledTimes(1);
    const picked = onChange.mock.calls[0][0];
    expect(picked).toBeInstanceOf(Date);
    expect(picked.getDate()).toBe(15);
  });
});
