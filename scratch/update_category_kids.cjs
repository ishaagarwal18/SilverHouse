const { poolPromise } = require('../Backend/db');

async function main() {
  const pool = await poolPromise;
  await pool.request().query("UPDATE dbo.category SET name = 'Kids Collection', slug = 'kids' WHERE category_id = 2;");
  const res = await pool.request().query("SELECT category_id, name, slug, ideal_for FROM dbo.category WHERE category_id = 2;");
  console.log('Updated category:', res.recordset);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
