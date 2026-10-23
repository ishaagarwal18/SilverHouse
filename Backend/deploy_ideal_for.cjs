const { poolPromise, sql } = require('./db');

async function deploy() {
  const pool = await poolPromise;
  console.log('Connected to MSSQL');

  // 1. Create dbo.ideal_for table
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ideal_for' AND schema_id = SCHEMA_ID('dbo'))
    BEGIN
      CREATE TABLE dbo.ideal_for (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ideal_for NVARCHAR(100) NOT NULL UNIQUE
      );
      PRINT 'Created dbo.ideal_for';
    END
  `);

  // 2. Seed values
  const seedValues = ['All', 'Women', 'Men', 'Kids', 'Unisex', 'Puja'];
  for (const val of seedValues) {
    await pool.request()
      .input('val', sql.NVarChar(100), val)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.ideal_for WHERE LOWER(LTRIM(RTRIM(ideal_for))) = LOWER(LTRIM(RTRIM(@val))))
        BEGIN
          INSERT INTO dbo.ideal_for (ideal_for) VALUES (@val);
          PRINT 'Inserted: ' + @val;
        END
      `);
  }

  // 3. Normalize existing product.ideal_for: 'ALL' -> 'All'
  await pool.request().query(`
    UPDATE dbo.product SET ideal_for = 'All' WHERE ideal_for = 'ALL';
    UPDATE dbo.category SET ideal_for = 'All' WHERE ideal_for = 'ALL';
  `);

  // 4. Create dbo.SP_ideal_for
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE dbo.SP_ideal_for
        @JSONstr NVARCHAR(MAX) = NULL,
        @opr     VARCHAR(20)   = 'SELECT',
        @id      VARCHAR(50)   = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        BEGIN TRY
            DECLARE @Val NVARCHAR(100);

            IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) = 1
            BEGIN
                SET @Val = LTRIM(RTRIM(COALESCE(
                    JSON_VALUE(@JSONstr, '$.table_values.ideal_for'),
                    JSON_VALUE(@JSONstr, '$.table_values.name'),
                    JSON_VALUE(@JSONstr, '$.table_values.value'),
                    JSON_VALUE(@JSONstr, '$.ideal_for')
                )));
            END;

            IF @opr = 'SELECT'
            BEGIN
                IF @id IS NOT NULL AND @id <> '' AND ISNUMERIC(@id) = 1
                BEGIN
                    SELECT id, ideal_for FROM dbo.ideal_for WHERE id = CAST(@id AS INT);
                END
                ELSE
                BEGIN
                    SELECT id, ideal_for FROM dbo.ideal_for ORDER BY id ASC;
                END
                RETURN;
            END

            IF @opr = 'ADD'
            BEGIN
                IF @Val IS NULL OR @Val = ''
                BEGIN
                    RAISERROR('Ideal For value is required.', 16, 1);
                    RETURN;
                END

                IF EXISTS (SELECT 1 FROM dbo.ideal_for WHERE LOWER(ideal_for) = LOWER(@Val))
                BEGIN
                    SELECT id, ideal_for FROM dbo.ideal_for WHERE LOWER(ideal_for) = LOWER(@Val);
                    RETURN;
                END

                INSERT INTO dbo.ideal_for (ideal_for)
                VALUES (@Val);

                DECLARE @NewId INT = SCOPE_IDENTITY();
                SELECT @NewId AS NewIdealForId, @NewId AS id, @Val AS ideal_for;
                RETURN;
            END

            IF @opr = 'EDIT'
            BEGIN
                DECLARE @EditId INT = NULL;
                IF @id IS NOT NULL AND @id <> '' AND ISNUMERIC(@id) = 1
                    SET @EditId = CAST(@id AS INT);
                ELSE IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) = 1
                    SET @EditId = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.id') AS INT);

                IF @EditId IS NULL
                BEGIN
                    RAISERROR('Missing target ID for EDIT operation.', 16, 1);
                    RETURN;
                END

                UPDATE dbo.ideal_for
                SET ideal_for = ISNULL(@Val, ideal_for)
                WHERE id = @EditId;

                SELECT id, ideal_for FROM dbo.ideal_for WHERE id = @EditId;
                RETURN;
            END

            IF @opr = 'DELETE'
            BEGIN
                DECLARE @DelId INT = NULL;
                IF @id IS NOT NULL AND @id <> '' AND ISNUMERIC(@id) = 1
                    SET @DelId = CAST(@id AS INT);
                ELSE IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) = 1
                    SET @DelId = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.id') AS INT);

                IF @DelId IS NULL
                BEGIN
                    RAISERROR('Missing target ID for DELETE operation.', 16, 1);
                    RETURN;
                END

                DELETE FROM dbo.ideal_for WHERE id = @DelId;
                SELECT 'SUCCESS' AS [status], 'Deleted ideal_for successfully' AS [message], @DelId AS [id];
                RETURN;
            END

            RAISERROR('Invalid operation specified for SP_ideal_for.', 16, 1);
        END TRY
        BEGIN CATCH
            DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
            RAISERROR(@ErrMsg, 16, 1);
        END CATCH
    END;
  `);
  console.log('Created dbo.SP_ideal_for');

  const rows = await pool.request().query('SELECT * FROM dbo.ideal_for ORDER BY id ASC');
  console.log('Current ideal_for rows:', rows.recordset);
  process.exit(0);
}

deploy().catch(err => { console.error(err); process.exit(1); });
