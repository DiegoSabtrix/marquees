declare module "cloudflare:workers" {
  type D1Result<T> = { results?: T[] };

  type D1PreparedStatement = {
    bind: (...values: unknown[]) => D1PreparedStatement;
    all: <T extends Record<string, unknown>>() => Promise<D1Result<T>>;
    run: () => Promise<unknown>;
  };

  type D1Database = {
    prepare: (sql: string) => D1PreparedStatement;
    batch: (statements: D1PreparedStatement[]) => Promise<unknown>;
  };

  export const env: {
    DB: D1Database;
  };
}
