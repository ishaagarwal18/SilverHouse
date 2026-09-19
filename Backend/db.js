require('dotenv').config();

const hasPassword = Boolean(process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '');
const isWindowsLocal = !hasPassword && process.platform === 'win32';

let sql;
let poolPromise;

if (isWindowsLocal) {
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
}

if (!poolPromise) {
    sql = require('mssql');
    let rawServer = (process.env.DB_SERVER || 'localhost').trim();
    let port = parseInt(process.env.DB_PORT || '1433');

    if (rawServer.includes(',')) {
        const parts = rawServer.split(',');
        rawServer = parts[0].trim();
        if (parts[1] && !isNaN(parseInt(parts[1].trim()))) {
            port = parseInt(parts[1].trim());
        }
    } else if (rawServer.includes(':')) {
        const parts = rawServer.split(':');
        rawServer = parts[0].trim();
        if (parts[1] && !isNaN(parseInt(parts[1].trim()))) {
            port = parseInt(parts[1].trim());
        }
    }

    const config = {
        server: rawServer,
        database: process.env.DB_NAME || 'SilverHouse',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: port,
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
};