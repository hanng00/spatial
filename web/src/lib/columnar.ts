/**
 * Utilities for column-oriented JSON data
 * Used for efficient API data transfer
 */

import type { Json } from "@/types/json";

/** Column-oriented JSON response format */
export interface ColumnarResponse {
  schema: {
    columns: string[];
    dtypes: string[];
  };
  data: Record<string, Json[]>;
}

/**
 * Convert column-oriented data to row-oriented records
 * @param columnar - Column-oriented response from API
 * @returns Array of record objects
 */
export function columnarToRows<T extends Record<string, Json>>(
  columnar: ColumnarResponse
): T[] {
  const { columns } = columnar.schema;
  const { data } = columnar;

  if (columns.length === 0) return [];

  const rowCount = data[columns[0]]?.length ?? 0;
  const rows: T[] = [];

  for (let i = 0; i < rowCount; i++) {
    const row = {} as Record<string, Json>;
    for (const col of columns) {
      row[col] = data[col]?.[i] ?? null;
    }
    rows.push(row as T);
  }

  return rows;
}

/**
 * Get the number of rows in a columnar response
 */
export function getRowCount(columnar: ColumnarResponse): number {
  const { columns } = columnar.schema;
  if (columns.length === 0) return 0;
  return columnar.data[columns[0]]?.length ?? 0;
}

