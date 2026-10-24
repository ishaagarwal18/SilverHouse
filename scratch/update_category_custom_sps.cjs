const path = require('path');
const { poolPromise } = require(path.join(__dirname, '../Backend/db'));

async function updateStoredProcedures() {
  const pool = await poolPromise;
  console.log('Connected to database, updating SP_category and SP_Fetchdata...');

  // 1. Update SP_category
  const spCategorySql = `
CREATE OR ALTER PROCEDURE dbo.SP_category
    @Opr       NVARCHAR(10),
    @JSONstr   NVARCHAR(MAX) = NULL,
    @Condition NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TargetId INT = TRY_CAST(@Condition AS INT);
    DECLARE @NewCategoryId INT;
    DECLARE @Name VARCHAR(50);
    DECLARE @Description VARCHAR(100);
    DECLARE @Slug VARCHAR(50);
    DECLARE @IdealFor VARCHAR(20);
    DECLARE @ImageId INT;
    DECLARE @Custom BIT;

    IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
    BEGIN
        SELECT
            @Name        = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.name'))),
            @Description = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.description'))),
            @Slug        = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.slug'))),
            @IdealFor    = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.ideal_for'))),
            @ImageId     = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.image_id') AS INT);

        -- Parse Custom bit
        DECLARE @RawCustom VARCHAR(20) = LOWER(LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.custom'))));
        IF @RawCustom IN ('true', '1', 'yes')
            SET @Custom = 1;
        ELSE IF @RawCustom IN ('false', '0', 'no')
            SET @Custom = 0;
        ELSE
            SET @Custom = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.custom') AS BIT);

        -- Fallback if 'title' or 'category_name' was passed instead of 'name'
        IF @Name IS NULL OR @Name = ''
            SET @Name = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.title')));
        IF @Name IS NULL OR @Name = ''
            SET @Name = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.category_name')));
    END

    IF @Opr IN ('EDIT', 'DELETE')
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM dbo.category WHERE category_id = @TargetId)
        BEGIN
            RAISERROR('Not Found: Category with ID %d does not exist.', 16, 1, @TargetId);
            RETURN;
        END
    END

    IF @Opr = 'SELECT'
    BEGIN
        IF @TargetId IS NOT NULL AND @TargetId > 0
            SELECT c.category_id, c.[name], c.[description], c.slug, c.ideal_for, c.image_id, i.image_url, ISNULL(c.custom, 0) AS custom 
            FROM dbo.category c
            LEFT JOIN dbo.[image] i ON c.image_id = i.image_id
            WHERE c.category_id = @TargetId;
        ELSE
            SELECT c.category_id, c.[name], c.[description], c.slug, c.ideal_for, c.image_id, i.image_url, ISNULL(c.custom, 0) AS custom 
            FROM dbo.category c
            LEFT JOIN dbo.[image] i ON c.image_id = i.image_id;
    END

    ELSE IF @Opr = 'ADD'
    BEGIN
        IF @Name IS NULL OR LEN(@Name) = 0
        BEGIN
            RAISERROR('Validation Error: name cannot be blank.', 16, 1);
            RETURN;
        END
        IF @Description IS NULL OR LEN(@Description) = 0
        BEGIN
            RAISERROR('Validation Error: description cannot be blank.', 16, 1);
            RETURN;
        END
        IF @Slug IS NULL OR LEN(@Slug) = 0
        BEGIN
            RAISERROR('Validation Error: slug cannot be blank.', 16, 1);
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM dbo.category WHERE [name] = @Name OR slug = @Slug)
        BEGIN
            RAISERROR('Validation Error: Category name or slug already exists.', 16, 1);
            RETURN;
        END

        SELECT @NewCategoryId = ISNULL(MAX(category_id), 0) + 1 FROM dbo.category;

        INSERT INTO dbo.category (category_id, [name], [description], slug, ideal_for, image_id, custom)
        VALUES (@NewCategoryId, @Name, @Description, @Slug, @IdealFor, @ImageId, ISNULL(@Custom, 0));

        SELECT @NewCategoryId AS NewCategoryId, 'Category added successfully' AS [Message];
    END

    ELSE IF @Opr = 'EDIT'
    BEGIN
        IF @Name IS NOT NULL AND EXISTS (SELECT 1 FROM dbo.category WHERE [name] = @Name AND category_id <> @TargetId)
        BEGIN
            RAISERROR('Validation Error: Category name "%s" is already taken.', 16, 1, @Name);
            RETURN;
        END
        IF @Slug IS NOT NULL AND EXISTS (SELECT 1 FROM dbo.category WHERE slug = @Slug AND category_id <> @TargetId)
        BEGIN
            RAISERROR('Validation Error: Category slug "%s" is already taken.', 16, 1, @Slug);
            RETURN;
        END

        UPDATE dbo.category
        SET [name]        = ISNULL(@Name, [name]),
            [description] = ISNULL(@Description, [description]),
            slug          = ISNULL(@Slug, slug),
            ideal_for     = CASE WHEN @IdealFor IS NOT NULL THEN @IdealFor ELSE ideal_for END,
            image_id      = CASE WHEN @ImageId IS NOT NULL THEN @ImageId ELSE image_id END,
            custom        = CASE WHEN @Custom IS NOT NULL THEN @Custom ELSE custom END
        WHERE category_id = @TargetId;

        SELECT @TargetId AS CategoryId, 'Category updated successfully' AS [Message];
    END

    ELSE IF @Opr = 'DELETE'
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.product WHERE category_id = @TargetId)
        BEGIN
            RAISERROR('Constraint Error: Cannot delete category because products are assigned to it.', 16, 1);
            RETURN;
        END

        DELETE FROM dbo.category WHERE category_id = @TargetId;
        SELECT @TargetId AS CategoryId, 'Category deleted successfully' AS [Message];
    END
END;
  `;

  await pool.request().query(spCategorySql);
  console.log('SP_category updated successfully!');

  // 2. Fetch full definition of SP_Fetchdata, replace Category Entity Fetcher with custom field, and execute
  const defRes = await pool.request().query("SELECT OBJECT_DEFINITION(OBJECT_ID('dbo.SP_Fetchdata')) AS def");
  let fetchDef = defRes.recordset[0].def;

  // Check if c.custom is already in SP_Fetchdata
  if (!fetchDef.includes('c.custom') && !fetchDef.includes('ISNULL(c.custom')) {
    fetchDef = fetchDef.replace(
      /SELECT\s+c\.category_id,\s+c\.name,\s+c\.description,\s+c\.slug,\s+c\.ideal_for,\s+c\.image_id,\s+i\.image_url/g,
      'SELECT c.category_id, c.name, c.description, c.slug, c.ideal_for, c.image_id, i.image_url, ISNULL(c.custom, 0) AS custom'
    );
    // Replace CREATE PROCEDURE with CREATE OR ALTER PROCEDURE
    fetchDef = fetchDef.replace(/^CREATE\s+PROCEDURE/i, 'CREATE OR ALTER PROCEDURE');
    await pool.request().query(fetchDef);
    console.log('SP_Fetchdata updated with custom column successfully!');
  } else {
    console.log('SP_Fetchdata already contains custom column.');
  }

  // 3. Test SELECT category via SP_Fetchdata
  const testRes = await pool.request()
    .input('proc_name', 'category')
    .input('JSONstr', null)
    .input('Condition', null)
    .execute('dbo.SP_Fetchdata');
  console.log('Fetched categories sample (with custom field):', testRes.recordset?.slice(0, 3));

  process.exit(0);
}

updateStoredProcedures().catch(err => {
  console.error('Error updating SPs:', err);
  process.exit(1);
});
