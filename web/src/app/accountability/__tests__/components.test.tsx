import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchResults } from "../components/SearchResults";
import type { PoliticianSearchResult } from "../types";

const sampleResult: PoliticianSearchResult = {
  intressent_id: "x1",
  display_name: "Example Person",
  party: "MP",
  electoral_district: "Göteborg",
  documents_authored: 4,
  speeches: 2,
  votes: 6,
  first_activity_date: "2024-01-01",
  last_activity_date: "2024-02-01",
};

describe("SearchResults component", () => {
  it("prompts when query is too short", () => {
    render(
      <SearchResults
        query="a"
        results={[]}
        isLoading={false}
        isError={false}
        onSelect={() => {}}
        selectedId={null}
      />
    );

    expect(screen.getByText(/Type at least/)).toBeInTheDocument();
  });

  it("renders results and handles selection", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <SearchResults
        query="example"
        results={[sampleResult]}
        isLoading={false}
        isError={false}
        onSelect={handleSelect}
        selectedId={null}
      />
    );

    expect(screen.getByText("Example Person")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Example Person/i }));
    expect(handleSelect).toHaveBeenCalledWith("x1");
  });
});
