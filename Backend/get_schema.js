const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'YourPassword@123',
  server: 'localhost',
  database: 'silverhouse',
  options: { encrypt: false, trustServerCertificate: true }
};

const pool = new sql.ConnectionPool(config);
pool.connect().then(async () => {
  try {
    let result = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'product'");
    console.log('--- PRODUCT TABLE ---');
    console.table(result.recordset);

    result = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'category'");
    console.log('--- CATEGORY TABLE ---');
    console.table(result.recordset);

    result = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'festival'");
    console.log('--- FESTIVAL TABLE ---');
    console.table(result.recordset);
  } catch (err) {
    console.error(err);
  } finally {
    pool.close();
  }
});
