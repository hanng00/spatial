import type { ColumnarResponse } from "@/lib/columnar";
import { fetchPoliticianDetail, searchPoliticians } from "../data";

describe("accountability data layer", () => {
  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it("parses search results with validation", async () => {
    const response: ColumnarResponse = {
      schema: { columns: ["intressent_id", "display_name", "party"], dtypes: [] },
      data: {
        intressent_id: ["a1"],
        display_name: ["Alice Andersson"],
        party: ["S"],
      },
    };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => response,
    }));

    const results = await searchPoliticians({ query: "alice" });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      intressent_id: "a1",
      display_name: "Alice Andersson",
      party: "S",
    });
  });

  it("parses detail payload into typed shape", async () => {
    const response: ColumnarResponse = {
      schema: { columns: ["summary", "docs", "votes", "speeches"], dtypes: [] },
      data: {
        summary: [
          [
            {
              intressent_id: "b2",
              display_name: "Bob Berg",
              party: "M",
              electoral_district: "Stockholm",
              documents_authored: 3,
              speeches: 1,
              votes: 2,
              yes_votes: 1,
              no_votes: 1,
              abstain_votes: 0,
              parliamentary_sessions_active: 1,
              first_activity_date: "2024-01-01",
              last_activity_date: "2024-02-01",
            },
          ],
        ],
        docs: [[{ dok_id: "d1", document_title: "Doc 1", document_date: "2024-01-02", derived_doc_type: "bet" }]],
        votes: [[{ dok_id: "v1", document_title: "Vote doc", document_date: "2024-01-03", vote_choice: "Ja", vote_description: "desc", vote_timestamp: "2024-01-03" }]],
        speeches: [[{ speech_id: "s1", dok_id: "d2", document_title: "Speech doc", document_date: "2024-01-04", parliamentary_session: "2024/25", speech_timestamp: "2024-01-04" }]],
      },
    };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => response,
    }));

    const detail = await fetchPoliticianDetail("b2");
    expect(detail?.summary?.display_name).toBe("Bob Berg");
    expect(detail?.documents[0]).toMatchObject({ dok_id: "d1", derived_doc_type: "bet" });
    expect(detail?.votes[0]).toMatchObject({ vote_choice: "Ja" });
    expect(detail?.speeches[0]).toMatchObject({ speech_id: "s1" });
  });
});
