/**
 * API functions for fetching motions by district
 */

import { columnarToRows, type ColumnarResponse } from "@/lib/columnar";
import { Json } from "@/types/json";

export interface Motion {
  dok_id: string;
  document_title: string;
  document_date: string;
  document_type: 'frs' | 'fr' | 'mot' | 'ip';
  committee: string | null;
  party: string | null;
  intressent_id: string | null;
  role: string | null;
  parliamentary_session: string | null;
}

export interface FetchMotionsParams {
  district: string;
  year?: number;
  month?: number;
  limit?: number;
}

/**
 * Fetch motions for a specific electoral district
 * API returns column-oriented JSON for efficiency, converted to rows client-side
 */
export async function fetchMotions(params: FetchMotionsParams): Promise<Motion[]> {
  const { district, year, month, limit } = params;

  const searchParams = new URLSearchParams();
  searchParams.set("district", district);
  if (year) searchParams.set("year", year.toString());
  if (month !== undefined) searchParams.set("month", month.toString());
  if (limit) searchParams.set("limit", limit.toString());

  const response = await fetch(`/api/map/motions?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch motions data");
  }

  const columnar: ColumnarResponse = await response.json();
  return columnarToRows<Motion & Record<string, Json>>(columnar);
}

/**
 * Get the Riksdag document URL for a motion
 */
export function getMotionUrl(dokId: string): string {
  return `https://www.riksdagen.se/sv/dokument-lagar/dokument/${dokId.toLowerCase()}`
}

/**
 * Get the HTML content URL for a motion
 */
export function getMotionHtmlUrl(dokId: string): string {
  return `https://data.riksdagen.se/dokument/${dokId}.html`
}

/**
 * Party abbreviation to full name mapping
 */
export const partyNames: Record<string, string> = {
  'S': 'Socialdemokraterna',
  'M': 'Moderaterna',
  'SD': 'Sverigedemokraterna',
  'C': 'Centerpartiet',
  'V': 'Vänsterpartiet',
  'KD': 'Kristdemokraterna',
  'L': 'Liberalerna',
  'MP': 'Miljöpartiet',
}

/**
 * Party colors for badges
 */
export const partyColors: Record<string, string> = {
  'S': 'bg-red-600',
  'M': 'bg-sky-600',
  'SD': 'bg-yellow-500',
  'C': 'bg-green-600',
  'V': 'bg-red-800',
  'KD': 'bg-blue-800',
  'L': 'bg-blue-500',
  'MP': 'bg-green-500',
}

