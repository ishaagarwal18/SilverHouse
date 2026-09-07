USE SilverHouse;
GO

IF OBJECT_ID('dbo.SP_productdata', 'P') IS NOT NULL 
    DROP PROCEDURE dbo.SP_productdata;
GO
USE SilverHouse;
GO

CREATE PROCEDURE dbo.SP_productdata
    @JSONstr   NVARCHAR(MAX) = NULL,
    @Condition NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FilterProductId    INT = TRY_CAST(@Condition AS INT);
    DECLARE @FilterCategoryId   INT;
    DECLARE @FilterCategoryName NVARCHAR(100);
    DECLARE @FilterMakeId       INT;
    DECLARE @FilterMakeType     NVARCHAR(50);
    DECLARE @FilterIdealFor     VARCHAR(20);
    DECLARE @FilterPurity       VARCHAR(30);
    DECLARE @FilterColor        NVARCHAR(50);
    DECLARE @FilterMinPrice     DECIMAL(18,2);
    DECLARE @FilterMaxPrice     DECIMAL(18,2);
    DECLARE @SearchKeyword      NVARCHAR(100);

    IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
    BEGIN
        SELECT
            @FilterProductId    = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.filters.product_id') AS INT), TRY_CAST(JSON_VALUE(@JSONstr, '$.product_id') AS INT), @FilterProductId),
            @FilterCategoryId   = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.filters.category_id') AS INT), TRY_CAST(JSON_VALUE(@JSONstr, '$.category_id') AS INT)),
            @FilterCategoryName = COALESCE(LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.filters.category_name'))), LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.category_name'))), LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.filters.category'))), LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.category')))),
            @FilterMakeId       = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.filters.m_id') AS INT), TRY_CAST(JSON_VALUE(@JSONstr, '$.m_id') AS INT)),
            @FilterMakeType     = COALESCE(LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.filters.make_type'))), LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.make_type')))),
            @FilterIdealFor     = COALESCE(LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.filters.ideal_for'))), LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.ideal_for')))),
            @FilterPurity       = COALESCE(LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.filters.purity'))), LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.purity')))),
            @FilterColor        = COALESCE(LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.filters.color'))), LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.color')))),
            @FilterMinPrice     = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.filters.min_price') AS DECIMAL(18,2)), TRY_CAST(JSON_VALUE(@JSONstr, '$.min_price') AS DECIMAL(18,2))),
            @FilterMaxPrice     = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.filters.max_price') AS DECIMAL(18,2)), TRY_CAST(JSON_VALUE(@JSONstr, '$.max_price') AS DECIMAL(18,2))),
            @SearchKeyword      = COALESCE(LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.filters.search'))), LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.search'))));
    END

    IF @FilterCategoryId IS NULL AND @FilterCategoryName IS NOT NULL AND @FilterCategoryName <> '' AND LOWER(@FilterCategoryName) <> 'all'
    BEGIN
        SELECT TOP 1 @FilterCategoryId = category_id
        FROM dbo.category
        WHERE LOWER(LTRIM(RTRIM(name))) = LOWER(LTRIM(RTRIM(@FilterCategoryName)))
           OR LOWER(LTRIM(RTRIM(slug))) = LOWER(LTRIM(RTRIM(@FilterCategoryName)));
    END

    SELECT 
        p.product_id,
        p.title AS product_name,
        p.purity,
        p.[weight],
        p.[description],
        p.price,
        p.discount,
        CAST(p.price - (p.price * ISNULL(p.discount, 0) / 100.0) AS DECIMAL(18,2)) AS final_price,
        p.quantity,
        p.ideal_for,
        p.packaging,
        p.labour_cost,
        p.actual_cost,
        p.[priority],
        ISNULL(p.color, 'Silver') AS color,
        ISNULL(p.review, 0) AS review,
        ISNULL(p.sold, 0) AS sold,

        -- Category Details
        p.category_id,
        c.[name] AS category_name,
        c.slug AS category_slug,

        -- Make Details
        p.m_id AS make_id,
        m.[type] AS make_type,

        -- Aggregated Array of Images
        ISNULL(
            (
                SELECT 
                    img.image_id,
                    img.image_url
                FROM dbo.product_image pi
                INNER JOIN dbo.[image] img ON pi.image_id = img.image_id
                WHERE pi.product_id = p.product_id
                FOR JSON PATH
            ),
            '[]'
        ) AS images_json

    FROM dbo.product p
    LEFT JOIN dbo.category c ON p.category_id = c.category_id
    LEFT JOIN dbo.make_master m ON p.m_id = m.m_id
    WHERE 
        (@FilterProductId IS NULL OR p.product_id = @FilterProductId)
        AND (@FilterCategoryId IS NULL OR p.category_id = @FilterCategoryId)
        AND (@FilterMakeId IS NULL OR p.m_id = @FilterMakeId)
        AND (@FilterMakeType IS NULL OR m.[type] = @FilterMakeType)
        AND (@FilterIdealFor IS NULL OR LOWER(LTRIM(RTRIM(p.ideal_for))) = LOWER(@FilterIdealFor))
        AND (@FilterPurity IS NULL OR p.purity LIKE '%' + @FilterPurity + '%')
        AND (@FilterColor IS NULL OR LOWER(LTRIM(RTRIM(p.color))) = LOWER(@FilterColor))
        AND (@FilterMinPrice IS NULL OR p.price >= @FilterMinPrice)
        AND (@FilterMaxPrice IS NULL OR p.price <= @FilterMaxPrice)
        AND (
            @SearchKeyword IS NULL 
            OR p.title LIKE '%' + @SearchKeyword + '%' 
            OR p.[description] LIKE '%' + @SearchKeyword + '%'
        )
    ORDER BY p.[priority] DESC, p.product_id DESC;
END;
GO
USE SilverHouse;
GO

IF OBJECT_ID('dbo.SP_Fetchdata', 'P') IS NOT NULL 
    DROP PROCEDURE dbo.SP_Fetchdata;
GO

--=============================================================================--
--                        SP_FetchData                                         --
--=============================================================================--
CREATE PROCEDURE dbo.SP_Fetchdata
    @proc_name   NVARCHAR(50),
    @JSONstr     NVARCHAR(MAX) = NULL,
    @Condition   NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Response NVARCHAR(MAX) = 'OK';
    SET @proc_name = LOWER(LTRIM(RTRIM(@proc_name)));

    IF @proc_name IS NULL OR @proc_name = ''
    BEGIN
        SET @Response = 'ERROR: proc_name cannot be empty.';
        SELECT @Response AS [Response_Status];
        RETURN;
    END

    BEGIN TRY
        -- 1. Product Details & Filtered Query Handler
        IF @proc_name IN ('product', 'product_details', 'products')
        BEGIN
            EXEC dbo.SP_productdata 
                @JSONstr   = @JSONstr, 
                @Condition = @Condition;
        END

        -- 2. Category Entity Fetcher
        ELSE IF @proc_name IN ('category', 'categories')
        BEGIN
            IF @Condition IS NOT NULL AND @Condition <> ''
                SELECT * FROM dbo.category WHERE category_id = TRY_CAST(@Condition AS INT);
            ELSE
                SELECT * FROM dbo.category ORDER BY category_id ASC;
        END

        -- 3. Image Entity Fetcher
        ELSE IF @proc_name IN ('image', 'images')
        BEGIN
            IF @Condition IS NOT NULL AND @Condition <> ''
                SELECT * FROM dbo.[image] WHERE image_id = TRY_CAST(@Condition AS INT);
            ELSE
                SELECT * FROM dbo.[image] ORDER BY image_id ASC;
        END

        -- 4. Make Master Fetcher
        ELSE IF @proc_name IN ('make_master', 'makes')
        BEGIN
            IF @Condition IS NOT NULL AND @Condition <> ''
                SELECT * FROM dbo.make_master WHERE m_id = TRY_CAST(@Condition AS INT);
            ELSE
                SELECT * FROM dbo.make_master ORDER BY m_id ASC;
        END

        -- 5. Product-Image Mapping Fetcher
        ELSE IF @proc_name IN ('product_image', 'product_images')
        BEGIN
            IF @Condition IS NOT NULL AND @Condition <> ''
            BEGIN
                SELECT pi.product_id, p.title AS product_name, pi.image_id, img.image_url
                FROM dbo.product_image pi
                INNER JOIN dbo.product p ON pi.product_id = p.product_id
                INNER JOIN dbo.[image] img ON pi.image_id = img.image_id
                WHERE pi.product_id = TRY_CAST(@Condition AS INT);
            END
            ELSE
            BEGIN
                SELECT pi.product_id, p.title AS product_name, pi.image_id, img.image_url
                FROM dbo.product_image pi
                INNER JOIN dbo.product p ON pi.product_id = p.product_id
                INNER JOIN dbo.[image] img ON pi.image_id = img.image_id;
            END
        END

        ELSE
        BEGIN
            SET @Response = 'ERROR: Unsupported proc_name "' + @proc_name + '".';
            SELECT @Response AS [Response_Status];
            RETURN;
        END

        SET @Response = 'OK';
        SELECT @Response AS [Response_Status];
    END TRY
    BEGIN CATCH
        SET @Response = 'ERROR [' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + ']: ' + ERROR_MESSAGE();
        SELECT @Response AS [Response_Status];
    END CATCH
END;
GO