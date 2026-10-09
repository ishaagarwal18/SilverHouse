--=============================================================================--
--                        SP_FetchData                                         --
--=============================================================================--
CREATE OR ALTER PROCEDURE dbo.SP_Fetchdata
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
            DECLARE @UserPhone NVARCHAR(20) = NULL;
            IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
                SET @UserPhone = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.phone')));

            IF @Condition IS NOT NULL AND @Condition <> ''
                SELECT user_id, full_name, phone, role, created_at FROM dbo.[user] WHERE user_id = TRY_CAST(@Condition AS INT) OR phone = @Condition;
            ELSE IF @UserPhone IS NOT NULL AND @UserPhone <> ''
                SELECT user_id, full_name, phone, role, created_at FROM dbo.[user] WHERE phone = @UserPhone;
            ELSE
                SELECT user_id, full_name, phone, role, created_at FROM dbo.[user] ORDER BY user_id DESC;
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
                ISNULL(u.phone, '') AS user_phone,
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

        -- 10. Ready-made / Catalog Orders Entity Fetcher (is_custom = 0, strictly NO confirm or custom options)
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
                COALESCE(o.customer_name, u.full_name, 'Guest Patron') AS customer_name,
                COALESCE(o.customer_email, '-') AS customer_email,
                COALESCE(o.customer_phone, u.phone, '-') AS customer_phone,
                o.total_amount,
                o.discount_amount,
                o.final_payable,
                o.payment_status,
                o.address_id,
                a.recipient_name,
                a.city,
                a.pincode,
                ISNULL(a.street + ', ' + a.city + ' - ' + a.pincode, 'Registered Address') AS delivery_address,
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
            WHERE ((@OrderFilterId IS NOT NULL AND o.order_id = @OrderFilterId)
               OR (@OrderFilterUid IS NOT NULL AND o.user_id = @OrderFilterUid)
               OR (@OrderFilterId IS NULL AND @OrderFilterUid IS NULL))
               AND ISNULL(o.is_custom, 0) = 0
            ORDER BY o.order_id DESC;
        END

        -- 10B. Bespoke Custom Orders Entity Fetcher (is_custom = 1, with confirm status, quotation & artisan review)
        ELSE IF @proc_name IN ('custom_orders', 'custom_order')
        BEGIN
            DECLARE @CustOrderFilterId INT = TRY_CAST(@Condition AS INT);
            DECLARE @CustOrderFilterUid INT = NULL;

            IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
            BEGIN
                SET @CustOrderFilterId  = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.order_id') AS INT), @CustOrderFilterId);
                SET @CustOrderFilterUid = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.user_id') AS INT);
            END

            SELECT 
                o.order_id,
                o.order_number,
                ISNULL(o.confirm, 'processing') AS [confirm],
                o.final_payable,
                o.custom_category,
                COALESCE(o.customer_name, u.full_name, 'Guest Patron') AS customer_name,
                COALESCE(o.customer_phone, u.phone, '-') AS customer_phone,
                COALESCE(o.customer_email, '-') AS customer_email,
                o.payment_status,
                o.description,
                o.image,
                o.total_amount,
                o.discount_amount,
                o.user_id,
                o.address_id,
                o.created_at
            FROM dbo.orders o
            LEFT JOIN dbo.[user] u ON o.user_id = u.user_id
            WHERE ((@CustOrderFilterId IS NOT NULL AND o.order_id = @CustOrderFilterId)
               OR (@CustOrderFilterUid IS NOT NULL AND o.user_id = @CustOrderFilterUid)
               OR (@CustOrderFilterId IS NULL AND @CustOrderFilterUid IS NULL))
               AND o.is_custom = 1
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

        -- 13. Company Entity Fetcher
        ELSE IF @proc_name IN ('company', 'companies')
        BEGIN
            IF @Condition IS NOT NULL AND @Condition <> ''
            BEGIN
                SELECT company_id, [name], [address], city, [state], pincode, gst_no, pan_card, contact_number, email, created_at, updated_at
                FROM dbo.company
                WHERE company_id = TRY_CAST(@Condition AS INT) 
                   OR LOWER([name]) LIKE '%' + LOWER(@Condition) + '%';
            END
            ELSE
            BEGIN
                SELECT company_id, [name], [address], city, [state], pincode, gst_no, pan_card, contact_number, email, created_at, updated_at
                FROM dbo.company
                ORDER BY company_id ASC;
            END
        END

        -- 14. Viewed / Recently Viewed Products Entity Fetcher
        ELSE IF @proc_name IN ('viewed', 'recently_viewed')
        BEGIN
            DECLARE @ViewUserId INT = TRY_CAST(@Condition AS INT);
            IF @ViewUserId IS NULL AND @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
            BEGIN
                SET @ViewUserId = TRY_CAST(COALESCE(JSON_VALUE(@JSONstr, '$.table_values.userid'), JSON_VALUE(@JSONstr, '$.userid'), JSON_VALUE(@JSONstr, '$.userId')) AS INT);
            END

            IF @ViewUserId IS NOT NULL AND @ViewUserId > 0
            BEGIN
                SELECT TOP 20
                    v.viewid,
                    v.productid,
                    v.userid,
                    v.createdAT,
                    p.product_id,
                    p.product_id AS id,
                    p.category_id,
                    p.title,
                    p.title AS name,
                    p.description,
                    p.price,
                    p.discount,
                    p.quantity,
                    p.purity,
                    p.weight,
                    p.ideal_for,
                    p.color,
                    p.review,
                    p.sold,
                    c.[name] AS category_name,
                    c.slug AS category_slug,
                    (
                        SELECT img.image_url 
                        FROM dbo.product_image pi2 
                        JOIN dbo.image img ON pi2.image_id = img.image_id 
                        WHERE pi2.product_id = p.product_id 
                        FOR JSON PATH
                    ) AS images_json
                FROM dbo.viewed v
                JOIN dbo.product p ON v.productid = p.product_id
                LEFT JOIN dbo.category c ON p.category_id = c.category_id
                WHERE v.userid = @ViewUserId
                ORDER BY v.createdAT DESC;
            END
            ELSE
            BEGIN
                SELECT 
                    v.viewid,
                    v.productid,
                    p.title AS product_name,
                    v.userid,
                    ISNULL(u.full_name, 'Guest Patron') AS customer_name,
                    u.phone AS customer_phone,
                    v.createdAT
                FROM dbo.viewed v
                LEFT JOIN dbo.product p ON v.productid = p.product_id
                LEFT JOIN dbo.[user] u ON v.userid = u.user_id
                ORDER BY v.createdAT DESC;
            END
        END

        -- 15. Store Parameters Entity Fetcher
        ELSE IF @proc_name IN ('store_parameter', 'store_parameters')
        BEGIN
            SELECT id, default_theme, wp_api, current_festival, created_at, updated_at
            FROM dbo.store_parameter
            ORDER BY id DESC;
        END

        -- 16. Phone OTP Verification Logs Fetcher
        ELSE IF @proc_name IN ('phone_otp', 'phone_otps', 'otp')
        BEGIN
            DELETE FROM dbo.phone_otp WHERE expires_at < DATEADD(minute, 330, SYSUTCDATETIME());

            SELECT id, phone, otp_code, expires_at, attempts, is_verified, created_at
            FROM dbo.phone_otp
            ORDER BY created_at DESC;
        END

        -- 17. Review Entity Fetcher
        ELSE IF @proc_name IN ('review', 'reviews')
        BEGIN
            DECLARE @ReviewFilterId   INT = TRY_CAST(@Condition AS INT);
            DECLARE @ReviewProductId  INT = NULL;
            DECLARE @ReviewUserId     INT = NULL;

            IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
            BEGIN
                SET @ReviewFilterId  = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.reviewid') AS INT), TRY_CAST(JSON_VALUE(@JSONstr, '$.reviewid') AS INT), @ReviewFilterId);
                SET @ReviewProductId = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.productid') AS INT), TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.product_id') AS INT), TRY_CAST(JSON_VALUE(@JSONstr, '$.productid') AS INT), TRY_CAST(JSON_VALUE(@JSONstr, '$.product_id') AS INT));
                SET @ReviewUserId    = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.userid') AS INT), TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.user_id') AS INT), TRY_CAST(JSON_VALUE(@JSONstr, '$.userid') AS INT), TRY_CAST(JSON_VALUE(@JSONstr, '$.user_id') AS INT));
            END

            -- If Condition is a product ID and no review matches that ID
            IF @ReviewFilterId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.review WHERE reviewid = @ReviewFilterId)
            BEGIN
                IF EXISTS (SELECT 1 FROM dbo.product WHERE product_id = @ReviewFilterId)
                BEGIN
                    SET @ReviewProductId = @ReviewFilterId;
                    SET @ReviewFilterId = NULL;
                END
            END

            SELECT 
                r.reviewid,
                r.productid,
                p.title AS product_name,
                r.userid,
                ISNULL(u.full_name, 'SilverHouse Patron') AS customer_name,
                ISNULL(u.phone, '') AS customer_phone,
                r.description,
                r.photo,
                r.star,
                r.created_at,
                r.updated_at,
                ISNULL((
                    SELECT TOP 1 img.image_url
                    FROM dbo.product_image pi
                    INNER JOIN dbo.[image] img ON pi.image_id = img.image_id
                    WHERE pi.product_id = r.productid
                ), '') AS product_image
            FROM dbo.review r
            LEFT JOIN dbo.product p ON r.productid = p.product_id
            LEFT JOIN dbo.[user] u ON r.userid = u.user_id
            WHERE (@ReviewFilterId IS NOT NULL AND r.reviewid = @ReviewFilterId)
               OR (@ReviewProductId IS NOT NULL AND r.productid = @ReviewProductId)
               OR (@ReviewUserId IS NOT NULL AND r.userid = @ReviewUserId)
               OR (@ReviewFilterId IS NULL AND @ReviewProductId IS NULL AND @ReviewUserId IS NULL)
            ORDER BY r.reviewid DESC;
        END

        -- 18. Festival Entity Fetcher
        ELSE IF @proc_name IN ('festival', 'festivals')
        BEGIN
            SELECT * FROM dbo.festival
            WHERE (@Condition IS NULL OR @Condition = '' OR id = @Condition);
        END

        -- 19. Festival Category Entity Fetcher
        ELSE IF @proc_name IN ('festival_category', 'festival_categories')
        BEGIN
            SELECT 
                fc.id,
                fc.category_id,
                c.name AS category_name,
                fc.festival_id,
                f.name AS festival_name,
                fc.created_at
            FROM dbo.festival_category fc
            LEFT JOIN dbo.category c ON fc.category_id = c.category_id
            LEFT JOIN dbo.festival f ON fc.festival_id = f.id;
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

--=============================================================================--
--                        SP_festival                                          --
--=============================================================================--
CREATE OR ALTER PROCEDURE dbo.SP_festival
    @Opr       NVARCHAR(10),
    @JSONstr   NVARCHAR(MAX) = NULL,
    @Condition NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET @Opr = UPPER(LTRIM(RTRIM(@Opr)));

    IF @Opr = 'SELECT'
    BEGIN
        SELECT * FROM dbo.festival
        WHERE (@Condition IS NULL OR @Condition = '' OR id = @Condition);
    END
    ELSE IF @Opr IN ('ADD', 'INSERT')
    BEGIN
        INSERT INTO dbo.festival (
            id, category_id, name, shortName, description, primary_website_category, start_date, end_date
        )
        VALUES (
            COALESCE(JSON_VALUE(@JSONstr, '$.table_values.id'), @Condition, 'FEST-' + CAST(ABS(CHECKSUM(NEWID())) % 10000 AS NVARCHAR(10))),
            TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.category_id') AS INT),
            JSON_VALUE(@JSONstr, '$.table_values.name'),
            JSON_VALUE(@JSONstr, '$.table_values.shortName'),
            JSON_VALUE(@JSONstr, '$.table_values.description'),
            JSON_VALUE(@JSONstr, '$.table_values.primary_website_category'),
            TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.start_date') AS DATE),
            TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.end_date') AS DATE)
        );
    END
    ELSE IF @Opr = 'EDIT'
    BEGIN
        DECLARE @TargetId NVARCHAR(50) = COALESCE(@Condition, JSON_VALUE(@JSONstr, '$.table_values.id'));
        UPDATE dbo.festival
        SET 
            name = COALESCE(JSON_VALUE(@JSONstr, '$.table_values.name'), name),
            shortName = COALESCE(JSON_VALUE(@JSONstr, '$.table_values.shortName'), shortName),
            description = COALESCE(JSON_VALUE(@JSONstr, '$.table_values.description'), description),
            category_id = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.category_id') AS INT), category_id),
            primary_website_category = COALESCE(JSON_VALUE(@JSONstr, '$.table_values.primary_website_category'), primary_website_category),
            start_date = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.start_date') AS DATE), start_date),
            end_date = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.end_date') AS DATE), end_date)
        WHERE id = @TargetId;
    END
    ELSE IF @Opr = 'DELETE'
    BEGIN
        DELETE FROM dbo.festival WHERE id = COALESCE(@Condition, JSON_VALUE(@JSONstr, '$.table_values.id'));
    END
END;
GO

--=============================================================================--
--                        SP_festival_category                                 --
--=============================================================================--
CREATE OR ALTER PROCEDURE dbo.SP_festival_category
    @Opr       NVARCHAR(10),
    @JSONstr   NVARCHAR(MAX) = NULL,
    @Condition NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET @Opr = UPPER(LTRIM(RTRIM(@Opr)));

    IF @Opr = 'SELECT'
    BEGIN
        SELECT 
            fc.id,
            fc.category_id,
            c.name AS category_name,
            fc.festival_id,
            f.name AS festival_name,
            fc.created_at
        FROM dbo.festival_category fc
        LEFT JOIN dbo.category c ON fc.category_id = c.category_id
        LEFT JOIN dbo.festival f ON fc.festival_id = f.id;
    END
    ELSE IF @Opr IN ('ADD', 'INSERT')
    BEGIN
        INSERT INTO dbo.festival_category (category_id, festival_id)
        VALUES (
            TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.category_id') AS INT),
            JSON_VALUE(@JSONstr, '$.table_values.festival_id')
        );
    END
    ELSE IF @Opr = 'EDIT'
    BEGIN
        DECLARE @FcId INT = TRY_CAST(COALESCE(@Condition, JSON_VALUE(@JSONstr, '$.table_values.id')) AS INT);
        UPDATE dbo.festival_category
        SET 
            category_id = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.category_id') AS INT), category_id),
            festival_id = COALESCE(JSON_VALUE(@JSONstr, '$.table_values.festival_id'), festival_id)
        WHERE id = @FcId;
    END
    ELSE IF @Opr = 'DELETE'
    BEGIN
        DELETE FROM dbo.festival_category WHERE id = TRY_CAST(COALESCE(@Condition, JSON_VALUE(@JSONstr, '$.table_values.id')) AS INT);
    END
END;
GO