import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import { DataTable, type Column } from "./DataTable";

// SearchInput debounces onChange by 300ms — fake timers + advance keep tests fast & deterministic.
jest.useFakeTimers();

type Row = { id: string; name: string; category: string };

const rows: Row[] = [
  { id: "1", name: "Alice", category: "VIP" },
  { id: "2", name: "Bob", category: "Regular" },
  { id: "3", name: "Charlie", category: "VIP" },
];

const columns: Column<Row>[] = [
  { header: "Name", cell: (r) => r.name },
  {
    header: "Category",
    cell: (r) => r.category,
    className: "text-right",
    headerClassName: "text-right",
  },
];

const predicate = (row: Row, term: string) =>
  row.name.toLowerCase().includes(term.toLowerCase());

function typeSearch(term: string) {
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: term },
  });
  // flush the 300ms debounce
  act(() => {
    jest.advanceTimersByTime(300);
  });
}

/** body rows = all <tr> minus the header row */
function bodyRowCount() {
  return screen.getAllByRole("row").length - 1;
}

describe("DataTable", () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  describe("rendering", () => {
    it("renders a header row for each column", () => {
      render(<DataTable rows={rows} columns={columns} />);

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Category")).toBeInTheDocument();
    });

    it("renders one body row per row", () => {
      render(<DataTable rows={rows} columns={columns} />);

      expect(bodyRowCount()).toBe(3);
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });

    it("renders the cell function output for each cell", () => {
      render(<DataTable rows={rows} columns={columns} />);

      // VIP appears on two rows
      expect(screen.getAllByText("VIP")).toHaveLength(2);
      expect(screen.getByText("Regular")).toBeInTheDocument();
    });

    it("applies column className to cells and headerClassName to headers", () => {
      render(<DataTable rows={rows} columns={columns} />);

      // header cell
      const header = screen.getByText("Category").closest("th");
      expect(header).toHaveClass("text-right");
      // body cell (Regular is unique)
      const cell = screen.getByText("Regular").closest("td");
      expect(cell).toHaveClass("text-right");
    });
  });

  describe("search omitted", () => {
    it("renders no search input when search prop is omitted", () => {
      render(<DataTable rows={rows} columns={columns} />);

      expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    });

    it("still renders all rows when search is omitted", () => {
      render(<DataTable rows={rows} columns={columns} />);

      expect(bodyRowCount()).toBe(3);
    });
  });

  describe("search filtering", () => {
    it("does not call predicate while the term is empty (empty short-circuit)", () => {
      const spyPredicate = jest.fn(predicate);
      render(
        <DataTable
          rows={rows}
          columns={columns}
          search={{ predicate: spyPredicate }}
        />
      );

      expect(spyPredicate).not.toHaveBeenCalled();
    });

    it("shows only matching rows for a typed term", () => {
      render(
        <DataTable rows={rows} columns={columns} search={{ predicate }} />
      );

      typeSearch("ali");

      expect(bodyRowCount()).toBe(1);
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.queryByText("Bob")).not.toBeInTheDocument();
      expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
    });

    it("matches case-insensitively (predicate decides)", () => {
      render(
        <DataTable rows={rows} columns={columns} search={{ predicate }} />
      );

      typeSearch("CHAR");

      expect(bodyRowCount()).toBe(1);
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });

    it("shows emptySearchMessage with correct colSpan when the term matches nothing", () => {
      render(
        <DataTable
          rows={rows}
          columns={columns}
          search={{ predicate }}
          emptySearchMessage="No customers match."
        />
      );

      typeSearch("zzz");

      expect(screen.getByText("No customers match.")).toBeInTheDocument();
      expect(bodyRowCount()).toBe(1); // the empty message row
      const emptyCell = screen.getByText("No customers match.").closest("td");
      expect(emptyCell).toHaveAttribute("colspan", "2");
    });

    it("shows all rows again after clearing the term", () => {
      render(
        <DataTable rows={rows} columns={columns} search={{ predicate }} />
      );

      typeSearch("ali");
      expect(bodyRowCount()).toBe(1);

      typeSearch("");
      expect(bodyRowCount()).toBe(3);
    });
  });

  describe("states", () => {
    it("shows a spinner row with colSpan = columns.length while loading", () => {
      render(<DataTable rows={[]} columns={columns} loading />);

      // Loader2 renders as an svg; the only row is the loading row
      expect(bodyRowCount()).toBe(1);
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
      const loadingCell = spinner?.closest("td");
      expect(loadingCell).toHaveAttribute("colspan", "2");
    });

    it("shows emptyMessage (not emptySearchMessage) when there is no data and no search", () => {
      render(
        <DataTable
          rows={[]}
          columns={columns}
          emptyMessage="No customers yet."
        />
      );

      expect(screen.getByText("No customers yet.")).toBeInTheDocument();
      // default emptySearchMessage must not leak
      expect(screen.queryByText("No results found.")).not.toBeInTheDocument();
    });

    it("uses sensible default messages when none are provided", () => {
      render(<DataTable rows={[]} columns={columns} />);

      expect(screen.getByText("No data found.")).toBeInTheDocument();
    });
  });

  describe("pagination", () => {
    it("is hidden when pagination is omitted (show all)", () => {
      render(<DataTable rows={rows} columns={columns} />);

      expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
      expect(bodyRowCount()).toBe(3);
    });

    it("is hidden when rows fit within one page", () => {
      render(
        <DataTable
          rows={rows}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      );

      expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
      expect(bodyRowCount()).toBe(3);
    });

    it("slices rows to pageSize and shows page controls", () => {
      render(
        <DataTable rows={rows} columns={columns} pagination={{ pageSize: 2 }} />
      );

      expect(bodyRowCount()).toBe(2); // page 1 of 2
      expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
    });

    it("navigates to the next page", () => {
      render(
        <DataTable rows={rows} columns={columns} pagination={{ pageSize: 2 }} />
      );

      fireEvent.click(screen.getByRole("button", { name: /next page/i }));

      expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
      expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    });

    it("disables prev on the first page and next on the last page", () => {
      render(
        <DataTable rows={rows} columns={columns} pagination={{ pageSize: 2 }} />
      );

      expect(
        screen.getByRole("button", { name: /previous page/i })
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /next page/i })
      ).not.toBeDisabled();

      fireEvent.click(screen.getByRole("button", { name: /next page/i }));

      expect(
        screen.getByRole("button", { name: /previous page/i })
      ).not.toBeDisabled();
      expect(screen.getByRole("button", { name: /next page/i })).toBeDisabled();
    });

    it("resets to page 1 when a search narrows the result", () => {
      render(
        <DataTable
          rows={rows}
          columns={columns}
          pagination={{ pageSize: 2 }}
          search={{ predicate }}
        />
      );

      // move to page 2
      fireEvent.click(screen.getByRole("button", { name: /next page/i }));
      expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();

      typeSearch("ali");

      expect(screen.getByText("Alice")).toBeInTheDocument();
      // only 1 match → pagination controls hide
      expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
    });

    it("clamps the page when rows shrink past the current page", () => {
      const { rerender } = render(
        <DataTable rows={rows} columns={columns} pagination={{ pageSize: 2 }} />
      );

      // go to page 2 (1 row: Charlie)
      fireEvent.click(screen.getByRole("button", { name: /next page/i }));

      // rows prop shrinks to a single row without search changing
      rerender(
        <DataTable
          rows={[rows[0]!]}
          columns={columns}
          pagination={{ pageSize: 2 }}
        />
      );

      // 1 row fits within pageSize → no pagination, row visible (no crash on out-of-range page)
      expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });
  });
});
