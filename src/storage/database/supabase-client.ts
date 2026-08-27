import { Pool } from 'pg';

/**
 * 本地 PostgreSQL 数据库适配层
 *
 * 原实现通过 Supabase JS Client（REST API）访问云数据库，
 * 现改为直接连接本地 PostgreSQL，保持 getSupabaseClient() 调用方式不变，
 * API 路由代码无需任何改动。
 *
 * 连接配置：环境变量 DATABASE_URL（默认 postgres://postgres:postgres@127.0.0.1:5432/aigc_yibin）
 */

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@127.0.0.1:5432/aigc_yibin',
  max: 10,
  idleTimeoutMillis: 30000,
});

type WhereClause = { column: string; operator: string; value: unknown };

interface QueryResult<T> {
  data: T | null;
  error: unknown | null;
}

/**
 * 链式查询构建器，兼容 Supabase 的 from().select().eq()... 调用风格。
 * thenable：await 后返回 { data, error }。
 */
class LocalQueryBuilder<T = any> implements PromiseLike<QueryResult<T>> {
  private table: string;
  private mode: 'select' | 'insert' | 'upsert' | 'delete' = 'select';
  private columns = '*';
  private wheres: WhereClause[] = [];
  private orderBys: { column: string; ascending: boolean }[] = [];
  private limit: number | null = null;
  private offset: number | null = null;
  private single = false;
  private insertData: Record<string, unknown> | null = null;
  private onConflict: string | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string): this {
    this.columns = columns;
    return this;
  }

  eq(column: string, value: unknown): this {
    this.wheres.push({ column, operator: '=', value });
    return this;
  }

  neq(column: string, value: unknown): this {
    this.wheres.push({ column, operator: '<>', value });
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }): this {
    this.orderBys.push({ column, ascending: opts?.ascending ?? true });
    return this;
  }

  range(from: number, to: number): this {
    this.offset = from;
    this.limit = to - from + 1;
    return this;
  }

  maybeSingle(): this {
    this.single = true;
    return this;
  }

  insert(data: Record<string, unknown>): this {
    this.mode = 'insert';
    this.insertData = data;
    return this;
  }

  upsert(data: Record<string, unknown>, opts?: { onConflict?: string }): this {
    this.mode = 'upsert';
    this.insertData = data;
    this.onConflict = opts?.onConflict ?? null;
    return this;
  }

  delete(): this {
    this.mode = 'delete';
    return this;
  }

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private buildWhereClause(): { clause: string; params: unknown[] } {
    const params: unknown[] = [];
    const conds = this.wheres.map((w) => {
      params.push(w.value);
      return `${w.column} ${w.operator} $${params.length}`;
    });
    return { clause: conds.join(' AND '), params };
  }

  private async execute(): Promise<QueryResult<T>> {
    let client;
    try {
      client = await pool.connect();
      const { clause, params } = this.buildWhereClause();

      if (this.mode === 'select') {
        const cols =
          this.columns.trim() === '*'
            ? '*'
            : this.columns
                .split(',')
                .map((c) => c.trim())
                .join(', ');
        let sql = `SELECT ${cols} FROM ${this.table}`;
        if (clause) sql += ` WHERE ${clause}`;
        if (this.orderBys.length) {
          sql +=
            ' ORDER BY ' +
            this.orderBys
              .map((o) => `${o.column} ${o.ascending ? 'ASC' : 'DESC'}`)
              .join(', ');
        }
        if (this.limit !== null) {
          params.push(this.limit);
          sql += ` LIMIT $${params.length}`;
        }
        if (this.offset !== null) {
          params.push(this.offset);
          sql += ` OFFSET $${params.length}`;
        }
        const res = await client.query(sql, params);
        const rows = res.rows as T[];
        return { data: this.single ? ((rows[0] ?? null) as T) : rows, error: null };
      }

      if (this.mode === 'insert' || this.mode === 'upsert') {
        const keys = Object.keys(this.insertData ?? {});
        if (keys.length === 0) {
          return { data: null, error: new Error('empty insert data') };
        }
        const values = keys.map((k) => this.insertData![k]);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        let sql = `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders})`;

        if (this.mode === 'upsert' && this.onConflict) {
          const conflictCol = this.onConflict;
          const updateCols = keys.filter((k) => k !== conflictCol);
          if (updateCols.length) {
            sql += ` ON CONFLICT (${conflictCol}) DO UPDATE SET ${updateCols
              .map((k) => `${k} = EXCLUDED.${k}`)
              .join(', ')}`;
          } else {
            sql += ` ON CONFLICT (${conflictCol}) DO NOTHING`;
          }
        }
        await client.query(sql, values);
        return { data: null, error: null };
      }

      if (this.mode === 'delete') {
        let sql = `DELETE FROM ${this.table}`;
        if (clause) sql += ` WHERE ${clause}`;
        await client.query(sql, params);
        return { data: null, error: null };
      }

      return { data: null, error: new Error('unknown mode') };
    } catch (e) {
      console.error('[local-db] query error:', e);
      return { data: null, error: e };
    } finally {
      if (client) client.release();
    }
  }
}

function getSupabaseClient() {
  return {
    from<T = any>(table: string): LocalQueryBuilder<T> {
      return new LocalQueryBuilder<T>(table);
    },
  };
}

export { getSupabaseClient };
