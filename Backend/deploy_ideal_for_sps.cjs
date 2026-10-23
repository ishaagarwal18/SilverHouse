const { poolPromise } = require('./db');
const fs = require('fs');

async function deploySPs() {
  const pool = await poolPromise;
  console.log('Connected to MSSQL for SP deployment');

  // 1. Update SP_GETDATA
  let procSql = fs.readFileSync('Files/procedure.sql', 'utf8');

  const spGetDataStart = procSql.indexOf('CREATE PROCEDURE dbo.SP_GETDATA');
  if (spGetDataStart === -1) {
    throw new Error('CREATE PROCEDURE dbo.SP_GETDATA not found in Files/procedure.sql');
  }

  let spGetDataSql = 'CREATE OR ALTER PROCEDURE dbo.SP_GETDATA' + procSql.slice(spGetDataStart + 'CREATE PROCEDURE dbo.SP_GETDATA'.length);
  spGetDataSql = spGetDataSql.replace(/\bGO\b/gi, '').trim();

  await pool.request().query(spGetDataSql);
  console.log('Executed updated SP_GETDATA on live DB');

  // Test SP_Fetchdata for ideal_for
  const testRes = await pool.request()
    .input('proc_name', 'ideal_for')
    .execute('dbo.SP_Fetchdata');
  console.log('Test SP_Fetchdata result:', testRes.recordset);

  // Test SP_GETDATA for ideal_for
  const testGetRes = await pool.request()
    .input('proc_name', 'ideal_for')
    .input('Opr', 'SELECT')
    .execute('dbo.SP_GETDATA');
  console.log('Test SP_GETDATA result:', testGetRes.recordset);

  process.exit(0);
}

deploySPs().catch(err => {
  console.error('Deployment error:', err);
  process.exit(1);
});
