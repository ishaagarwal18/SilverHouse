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
    ORDER BY 
        CASE WHEN p.[priority] > 0 THEN 0 ELSE 1 END ASC,
        p.[priority] ASC,
        p.product_id ASC;
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

        -- 2. Category Entity Fetcher (with joined image_url)
        ELSE IF @proc_name IN ('category', 'categories')
        BEGIN
            IF @Condition IS NOT NULL AND @Condition <> ''
            BEGIN
                SELECT 
                    c.category_id,
                    c.name,
                    c.description,
                    c.slug,
                    c.ideal_for,
                    c.image_id,
                    i.image_url
                FROM dbo.category c
                LEFT JOIN dbo.[image] i ON c.image_id = i.image_id
                WHERE c.category_id = TRY_CAST(@Condition AS INT)
                   OR LOWER(LTRIM(RTRIM(c.slug))) = LOWER(LTRIM(RTRIM(@Condition)));
            END
            ELSE
            BEGIN
                SELECT 
                    c.category_id,
                    c.name,
                    c.description,
                    c.slug,
                    c.ideal_for,
                    c.image_id,
                    i.image_url
                FROM dbo.category c
                LEFT JOIN dbo.[image] i ON c.image_id = i.image_id
                ORDER BY c.category_id ASC;
            END
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

        -- 6. User Entity Fetcher
        ELSE IF @proc_name IN ('user', 'users')
        BEGIN
            DECLARE @UserEmail NVARCHAR(150) = NULL;
            IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
                SET @UserEmail = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.email')));

            IF @Condition IS NOT NULL AND @Condition <> ''
                SELECT user_id, full_name, email, phone, role, created_at FROM dbo.[user] WHERE user_id = TRY_CAST(@Condition AS INT) OR LOWER(email) = LOWER(@Condition);
            ELSE IF @UserEmail IS NOT NULL AND @UserEmail <> ''
                SELECT user_id, full_name, email, phone, role, created_at FROM dbo.[user] WHERE LOWER(email) = LOWER(@UserEmail);
            ELSE
                SELECT user_id, full_name, email, phone, role, created_at FROM dbo.[user] ORDER BY user_id DESC;
        END

        -- 7. Address Entity Fetcher
        ELSE IF @proc_name IN ('address', 'addresses')
        BEGIN
            DECLARE @AddrUserId INT = NULL;
            IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
                SET @AddrUserId = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.user_id') AS INT);

            IF @Condition IS NOT NULL AND @Condition <> ''
                SELECT a.*, u.full_name AS user_name FROM dbo.address a LEFT JOIN dbo.[user] u ON a.user_id = u.user_id WHERE a.address_id = TRY_CAST(@Condition AS INT) OR a.user_id = TRY_CAST(@Condition AS INT);
            ELSE IF @AddrUserId IS NOT NULL
                SELECT a.*, u.full_name AS user_name FROM dbo.address a LEFT JOIN dbo.[user] u ON a.user_id = u.user_id WHERE a.user_id = @AddrUserId ORDER BY a.address_id DESC;
            ELSE
                SELECT a.*, u.full_name AS user_name FROM dbo.address a LEFT JOIN dbo.[user] u ON a.user_id = u.user_id ORDER BY a.address_id DESC;
        END

        -- 8. Cart Header Fetcher
        ELSE IF @proc_name IN ('cart', 'carts')
        BEGIN
            DECLARE @CartFilterUid INT = TRY_CAST(@Condition AS INT);
            IF @CartFilterUid IS NULL AND @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
                SET @CartFilterUid = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.user_id') AS INT);

            SELECT 
                c.cart_id,
                c.user_id,
                ISNULL(u.full_name, 'Guest Patron') AS user_name,
                u.email AS user_email,
                c.guest_token,
                (SELECT COUNT(*) FROM dbo.cart_item ci WHERE ci.cart_id = c.cart_id) AS total_items,
                (SELECT ISNULL(SUM(ci.quantity), 0) FROM dbo.cart_item ci WHERE ci.cart_id = c.cart_id) AS total_quantity,
                c.updated_at
            FROM dbo.cart c
            LEFT JOIN dbo.[user] u ON c.user_id = u.user_id
            WHERE (@CartFilterUid IS NULL OR c.user_id = @CartFilterUid OR c.cart_id = @CartFilterUid)
            ORDER BY c.cart_id DESC;
        END

        -- 9. Cart Items Fetcher
        ELSE IF @proc_name IN ('cart_item', 'cart_items')
        BEGIN
            DECLARE @CIFilterCartId INT = TRY_CAST(@Condition AS INT);
            DECLARE @CIFilterUid    INT = NULL;
            DECLARE @CIFilterGToken NVARCHAR(100) = NULL;

            IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
            BEGIN
                SET @CIFilterCartId = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.cart_id') AS INT), @CIFilterCartId);
                SET @CIFilterUid    = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.user_id') AS INT);
                SET @CIFilterGToken = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.guest_token')));
            END

            SELECT 
                ci.cart_item_id,
                ci.cart_id,
                c.user_id,
                ISNULL(u.full_name, 'Guest Patron') AS user_name,
                ci.product_id,
                p.title AS product_name,
                p.price AS unit_price,
                ci.quantity,
                CAST(p.price * ci.quantity AS DECIMAL(18,2)) AS subtotal,
                ci.created_at,
                ISNULL((
                    SELECT TOP 1 img.image_url
                    FROM dbo.product_image pi
                    INNER JOIN dbo.[image] img ON pi.image_id = img.image_id
                    WHERE pi.product_id = ci.product_id
                ), '') AS image_url
            FROM dbo.cart_item ci
            LEFT JOIN dbo.cart c ON ci.cart_id = c.cart_id
            LEFT JOIN dbo.[user] u ON c.user_id = u.user_id
            LEFT JOIN dbo.product p ON ci.product_id = p.product_id
            WHERE (@CIFilterCartId IS NOT NULL AND ci.cart_id = @CIFilterCartId)
               OR (@CIFilterUid IS NOT NULL AND c.user_id = @CIFilterUid)
               OR (@CIFilterGToken IS NOT NULL AND c.guest_token = @CIFilterGToken)
               OR (@CIFilterCartId IS NULL AND @CIFilterUid IS NULL AND @CIFilterGToken IS NULL)
            ORDER BY ci.cart_item_id DESC;
        END

        -- 10. Orders Entity Fetcher (with embedded items_json)
        ELSE IF @proc_name IN ('orders', 'order', 'order_details')
        BEGIN
            DECLARE @OrderFilterId INT = TRY_CAST(@Condition AS INT);
            DECLARE @OrderFilterUid INT = NULL;

            IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
            BEGIN
                SET @OrderFilterId  = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.order_id') AS INT), @OrderFilterId);
                SET @OrderFilterUid = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.user_id') AS INT);
            END

            SELECT 
                o.order_id,
                o.order_number,
                o.user_id,
                ISNULL(u.full_name, 'Guest Patron') AS customer_name,
                u.email AS customer_email,
                u.phone AS customer_phone,
                o.address_id,
                a.recipient_name,
                a.city,
                a.pincode,
                ISNULL(a.street + ', ' + a.city + ' - ' + a.pincode, 'Registered Address') AS delivery_address,
                o.total_amount,
                o.discount_amount,
                o.final_payable,
                o.payment_status,
                o.created_at,
                (
                    SELECT 
                        oi.order_item_id,
                        oi.order_id,
                        oi.product_id,
                        p.title AS product_name,
                        p.price AS current_price,
                        oi.unit_price,
                        oi.discount_percent,
                        oi.quantity,
                        oi.subtotal,
                        ISNULL((
                            SELECT TOP 1 img.image_url
                            FROM dbo.product_image pi
                            INNER JOIN dbo.[image] img ON pi.image_id = img.image_id
                            WHERE pi.product_id = oi.product_id
                        ), '') AS image_url
                    FROM dbo.order_item oi
                    LEFT JOIN dbo.product p ON oi.product_id = p.product_id
                    WHERE oi.order_id = o.order_id
                    FOR JSON PATH
                ) AS items_json
            FROM dbo.orders o
            LEFT JOIN dbo.[user] u ON o.user_id = u.user_id
            LEFT JOIN dbo.address a ON o.address_id = a.address_id
            WHERE (@OrderFilterId IS NOT NULL AND o.order_id = @OrderFilterId)
               OR (@OrderFilterUid IS NOT NULL AND o.user_id = @OrderFilterUid)
               OR (@OrderFilterId IS NULL AND @OrderFilterUid IS NULL)
            ORDER BY o.order_id DESC;
        END

        -- 11. Order Items Fetcher
        ELSE IF @proc_name IN ('order_item', 'order_items')
        BEGIN
            DECLARE @OIFilterOrderId INT = TRY_CAST(@Condition AS INT);
            IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
                SET @OIFilterOrderId = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.order_id') AS INT), @OIFilterOrderId);

            SELECT 
                oi.order_item_id,
                oi.order_id,
                o.order_number,
                oi.product_id,
                p.title AS product_name,
                oi.unit_price,
                oi.discount_percent,
                oi.quantity,
                oi.subtotal,
                ISNULL((
                    SELECT TOP 1 img.image_url
                    FROM dbo.product_image pi
                    INNER JOIN dbo.[image] img ON pi.image_id = img.image_id
                    WHERE pi.product_id = oi.product_id
                ), '') AS image_url
            FROM dbo.order_item oi
            LEFT JOIN dbo.orders o ON oi.order_id = o.order_id
            LEFT JOIN dbo.product p ON oi.product_id = p.product_id
            WHERE (@OIFilterOrderId IS NOT NULL AND oi.order_id = @OIFilterOrderId)
               OR (@OIFilterOrderId IS NULL)
            ORDER BY oi.order_item_id DESC;
        END

        -- 12. Wishlist Entity Fetcher
        ELSE IF @proc_name IN ('wishlist', 'wishlists')
        BEGIN
            DECLARE @WLFilterUid INT = TRY_CAST(@Condition AS INT);
            IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
                SET @WLFilterUid = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.user_id') AS INT), @WLFilterUid);

            SELECT 
                w.wishlist_id,
                w.user_id,
                w.product_id,
                p.title AS product_name,
                p.purity,
                p.[weight],
                p.price,
                p.discount,
                CAST(p.price - (p.price * ISNULL(p.discount, 0.00) / 100.0) AS DECIMAL(18,2)) AS final_price,
                p.quantity AS stock_available,
                w.created_at,
                ISNULL((
                    SELECT TOP 1 img.image_url
                    FROM dbo.product_image pi
                    INNER JOIN dbo.[image] img ON pi.image_id = img.image_id
                    WHERE pi.product_id = w.product_id
                ), '') AS image_url
            FROM dbo.wishlist w
            INNER JOIN dbo.product p ON w.product_id = p.product_id
            WHERE (@WLFilterUid IS NULL OR w.user_id = @WLFilterUid)
            ORDER BY w.wishlist_id DESC;
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