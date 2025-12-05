/**
 * API functions for document geography data
 */

import { columnarToRows, type ColumnarResponse } from "@/lib/columnar";
import type { DocumentGeographyData } from "./mapData";

export interface FetchDocumentGeographyParams {
  year?: number;
  month?: number;
}

/**
 * Fetch document geography data from API
 * API returns column-oriented JSON for efficiency, converted to rows client-side
 */
export async function fetchDocumentGeography(
  params: FetchDocumentGeographyParams = {}
): Promise<DocumentGeographyData[]> {
  const { year, month } = params;

  const searchParams = new URLSearchParams();
  if (year) searchParams.set("year", year.toString());
  if (month) searchParams.set("month", month.toString());

  const response = await fetch(`/api/map/documents?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch document geography data");
  }

  const columnar: ColumnarResponse = await response.json();
  return columnarToRows<DocumentGeographyData>(columnar);
}

