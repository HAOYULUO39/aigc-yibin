/**
 * 本地 PostgreSQL 数据库管理脚本（基于 embedded-postgres）
 *
 * 用法：
 *   node scripts/db.mjs init    # 首次初始化：initdb + 建库 + 建表 + 默认数据
 *   node scripts/db.mjs start   # 启动 PostgreSQL（保持运行，配合后台运行使用）
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, '.pgdata');
const DB_NAME = 'aigc_yibin';
const PORT = 5432;
const USER = 'postgres';
const PASSWORD = 'postgres';

const { default: EmbeddedPostgres } = await import('embedded-postgres');

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  port: PORT,
  user: USER,
  password: PASSWORD,
  authMethod: 'password',
  persistent: true,
  onLog: (m) => console.log('[pg]', m),
  onError: (e) => console.error('[pg-err]', e),
});

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(11) NOT NULL,
  role VARCHAR(20) NOT NULL,
  occupation VARCHAR(30) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS registrations_created_at_idx ON registrations (created_at);
CREATE INDEX IF NOT EXISTS registrations_role_idx ON registrations (role);

CREATE TABLE IF NOT EXISTS sponsors (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL,
  contact_name VARCHAR(50) NOT NULL,
  phone VARCHAR(11) NOT NULL,
  wechat VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sponsors_created_at_idx ON sponsors (created_at);

CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS health_check (
  id SERIAL NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
`;

const DEFAULT_SETTINGS = {
  organizers: 'Datawhale / 宜宾市大数据有限责任公司 / 展望数科（成都）科技有限公司 / 智创会',
  event_date: '九月中旬',
  location: '宜宾市大数据产业园',
  qrcode: '/qrcode.jpg',
};

async function init() {
  const isInitialised = fs.existsSync(path.join(dataDir, 'PG_VERSION'));
  if (!isInitialised) {
    console.log('Initialising PostgreSQL cluster...');
    await pg.initialise();
    console.log('Cluster initialised.');
  } else {
    console.log('Cluster already initialised, skipping initdb.');
  }

  await pg.start();
  try {
    await pg.createDatabase(DB_NAME).catch((e) => {
      if (String(e).includes('already exists')) {
        console.log(`Database "${DB_NAME}" already exists.`);
        return;
      }
      throw e;
    });
    console.log(`Database "${DB_NAME}" ready.`);

    const client = pg.getPgClient(DB_NAME);
    await client.connect();
    try {
      await client.query(SCHEMA_SQL);
      console.log('Schema created (registrations / sponsors / site_settings / health_check).');

      for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        await client.query(
          `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
          [key, value],
        );
      }
      console.log('Default site settings seeded.');
    } finally {
      await client.end();
    }
  } finally {
    await pg.stop();
    console.log('PostgreSQL stopped (init done).');
  }
}

async function start() {
  await pg.start();
  console.log(`PostgreSQL is running on 127.0.0.1:${PORT} (database: ${DB_NAME})`);

  // 保持进程存活，优雅退出
  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  // never-resolving promise keeps the event loop alive
  await new Promise(() => {});
}

const cmd = process.argv[2];
if (cmd === 'init') {
  await init();
} else if (cmd === 'start') {
  await start();
} else {
  console.log('Usage: node scripts/db.mjs init|start');
  process.exit(1);
}
