import { Json } from "@/types/json";
import { DuckDBInstance } from "@duckdb/node-api";

const token = process.env.MOTHERDUCK_ACCESS_TOKEN;
const database = process.env.DATABASE_NAME || "spatial_dagster";

/** Column-oriented JSON format for efficient data transfer */
export interface ColumnarResult {
  schema: {
    columns: string[];
    dtypes: string[];
  };
  data: Record<string, Json[]>;
}

export class MotherDuckClient {
  private constructor(private readonly instance: DuckDBInstance) {
    this.instance = instance;
  }

  static async createInstance() {
    const connectionString = `md:${database}?motherduck_token=${token}`;
    return new MotherDuckClient(await DuckDBInstance.create(connectionString));
  }

  async execute(sql: string): Promise<ColumnarResult> {
    const conn = await this.instance.connect();
    const reader = await conn.runAndReadAll(sql);

    const columnCount = reader.columnCount;
    const columns: string[] = [];
    const dtypes: string[] = [];

    for (let i = 0; i < columnCount; i++) {
      columns.push(reader.columnName(i));
      dtypes.push(reader.columnType(i).toString());
    }

    return {
      schema: { columns, dtypes },
      data: reader.getColumnsObjectJson(),
    };
  }
}
