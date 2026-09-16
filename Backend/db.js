require('dotenv').config();

const isPostgres = Boolean(process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://')));
const hasPassword = Boolean(process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '');
const isWindowsLocal = !isPostgres && !hasPassword && process.platform === 'win32';

let sql = null;
let poolPromise = null;

if (isPostgres) {
    console.log('[Database] DATABASE_URL detected: Running in PostgreSQL mode (Neon Cloud)');
    const { getPgPool } = require('./postgres_adapter');
    // Ping Neon database
    getPgPool().query('SELECT NOW()')
        .then(r => console.log(`[Database] Successfully connected to Neon PostgreSQL at ${r.rows[0].now}`))
        .catch(err => console.error('[Database Error] Failed to connect to Neon PostgreSQL:', err.message));
} else if (isWindowsLocal) {
    try {
        sql = require('mssql/msnodesqlv8');
        const server = process.env.DB_SERVER || '.\\SQLEXPRESS';
        const database = process.env.DB_NAME || 'SilverHouse';
        const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${server};Database=${database};Trusted_Connection=yes;`;
        
        poolPromise = new sql.ConnectionPool({ connectionString })
            .connect()
            .then((pool) => {
                console.log(`[Database] Connected to MSSQL Database '${database}' on '${server}' via Windows Auth`);
                return pool;
            })
            .catch((err) => {
                console.error('[Database Error] Connection failed:', err.message);
            });
    } catch (e) {
        console.warn('[Database] msnodesqlv8 not available, falling back to standard TDS driver');
        sql = require('mssql');
    }
} else {
    sql = require('mssql');
    const config = {
        server: process.env.DB_SERVER || 'localhost',
        database: process.env.DB_NAME || 'SilverHouse',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '1433'),
        options: {
            encrypt: process.env.DB_ENCRYPT === 'false' ? false : true,
            trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'false' ? false : true
        }
    };

    poolPromise = sql.connect(config)
        .then((pool) => {
            console.log(`[Database] Connected to cloud MSSQL Database '${config.database}' on '${config.server}' via TDS`);
            return pool;
        })
        .catch((err) => {
            console.error('[Database Error] Cloud connection failed:', err.message);
        });
}

module.exports = {
    sql,
    poolPromise,
    isPostgres
};