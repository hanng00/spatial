declare module 'duckdb' {
  export class Database {
    constructor(path: string, callback?: (err: Error | null) => void);
    connect(): Connection;
    close(callback?: (err: Error | null) => void): void;
  }

  export class Connection {
    all<T = Record<string, unknown>>(
      sql: string,
      ...params: unknown[]
    ): void;
    all<T = Record<string, unknown>>(
      sql: string,
      callback: (err: Error | null, rows: T[]) => void
    ): void;
    all<T = Record<string, unknown>>(
      sql: string,
      ...paramsAndCallback: [...unknown[], (err: Error | null, rows: T[]) => void]
    ): void;
    
    run(sql: string, ...params: unknown[]): void;
    run(sql: string, callback: (err: Error | null) => void): void;
    
    exec(sql: string, callback?: (err: Error | null) => void): void;
    
    close(callback?: (err: Error | null) => void): void;
  }
}

