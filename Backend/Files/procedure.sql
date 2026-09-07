USE SilverHouse;
GO

-- 1. DROP ALL EXISTING PROCEDURES
IF OBJECT_ID('dbo.SP_GETDATA', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_GETDATA;
IF OBJECT_ID('dbo.SP_product', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_product;
IF OBJECT_ID('dbo.SP_category', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_category;
IF OBJECT_ID('dbo.SP_image', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_image;
IF OBJECT_ID('dbo.SP_make_master', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_make_master;
IF OBJECT_ID('dbo.SP_product_image', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_product_image;
IF OBJECT_ID('dbo.SP_user', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_user;
IF OBJECT_ID('dbo.SP_address', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_address;
IF OBJECT_ID('dbo.SP_cart', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_cart;
GO

-- =========================================================================
-- PROCEDURE 1: SP_product
-- =========================================================================
CREATE PROCEDURE dbo.SP_product
    @Opr       NVARCHAR(10),
    @JSONstr   NVARCHAR(MAX) = NULL,
    @Condition NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TargetId INT = TRY_CAST(@Condition AS INT);
    DECLARE @NewProductId INT;
    
    DECLARE @InputProductId INT;
    DECLARE @CategoryId INT;
    DECLARE @MakeId INT;
    DECLARE @Purity VARCHAR(30);
    DECLARE @Weight VARCHAR(30);
    DECLARE @Title VARCHAR(50);
    DECLARE @Description VARCHAR(200);
    DECLARE @Price DECIMAL(18,2);
    DECLARE @Discount DECIMAL(4,2);
    DECLARE @Quantity INT;
    DECLARE @IdealFor VARCHAR(15);
    DECLARE @Packaging VARCHAR(50);
    DECLARE @LabourCost DECIMAL(18,2);
    DECLARE @ActualCost DECIMAL(18,2);
    DECLARE @Priority INT;
    DECLARE @Color VARCHAR(50);
    DECLARE @Review INT;
    DECLARE @Sold INT;

    -- Extract JSON fields
    IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
    BEGIN
        SELECT
            @InputProductId = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.product_id') AS INT),
            @CategoryId     = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.category_id') AS INT),
            @MakeId         = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.m_id') AS INT),
            @Purity         = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.purity'))),
            @Weight         = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.weight'))),
            @Title          = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.title'))),
            @Description    = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.description'))),
            @Price          = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.price') AS DECIMAL(18,2)),
            @Discount       = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.discount') AS DECIMAL(4,2)),
            @Quantity       = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.quantity') AS INT),
            @IdealFor       = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.ideal_for'))),
            @Packaging      = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.packaging'))),
            @LabourCost     = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.labour_cost') AS DECIMAL(18,2)),
            @ActualCost     = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.actual_cost') AS DECIMAL(18,2)),
            @Priority       = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.priority') AS INT),
            @Color          = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.color'))),
            @Review         = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.review') AS INT),
            @Sold           = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.sold') AS INT);

        IF @Title IS NULL OR @Title = ''
            SET @Title = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.name')));

        IF @CategoryId IS NULL
        BEGIN
            DECLARE @CategoryNameInput NVARCHAR(100) = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.category_name')));
            IF @CategoryNameInput IS NULL OR @CategoryNameInput = ''
                SET @CategoryNameInput = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.category')));

            IF @CategoryNameInput IS NOT NULL AND @CategoryNameInput <> ''
            BEGIN
                SELECT TOP 1 @CategoryId = category_id 
                FROM dbo.category 
                WHERE LOWER(LTRIM(RTRIM(name))) = LOWER(LTRIM(RTRIM(@CategoryNameInput)));
            END
        END
    END

    -- Existence Check for EDIT / DELETE
    IF @Opr IN ('EDIT', 'DELETE')
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE product_id = @TargetId)
        BEGIN
            RAISERROR('Not Found: Product with ID %d does not exist.', 16, 1, @TargetId);
            RETURN;
        END
    END

    -- SELECT (Ordered by priority descending, then newest product_id)
    IF @Opr = 'SELECT'
    BEGIN
        IF @TargetId IS NOT NULL AND @TargetId > 0
            SELECT * FROM dbo.product WHERE product_id = @TargetId;
        ELSE
            SELECT * FROM dbo.product ORDER BY [priority] DESC, product_id DESC;
    END

    -- ADD
    ELSE IF @Opr = 'ADD'
    BEGIN
        IF @CategoryId IS NULL
        BEGIN
            RAISERROR('Validation Error: category_id is required.', 16, 1);
            RETURN;
        END
        IF NOT EXISTS (SELECT 1 FROM dbo.category WHERE category_id = @CategoryId)
        BEGIN
            RAISERROR('Validation Error: CategoryId %d does not exist in dbo.category.', 16, 1, @CategoryId);
            RETURN;
        END
        IF @MakeId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.make_master WHERE m_id = @MakeId)
        BEGIN
            RAISERROR('Validation Error: m_id %d does not exist in dbo.make_master.', 16, 1, @MakeId);
            RETURN;
        END

        IF @Purity IS NULL OR LEN(@Purity) = 0 SET @Purity = '92.5 Sterling';
        IF @Weight IS NULL OR LEN(@Weight) = 0 SET @Weight = 'N/A';
        IF @Title IS NULL OR LEN(@Title) = 0 SET @Title = 'Silver Product';
        IF @Description IS NULL OR LEN(@Description) = 0 SET @Description = 'Silver Jewelry';
        IF @Price IS NULL OR @Price < 0
        BEGIN
            RAISERROR('Validation Error: price must be a valid non-negative number.', 16, 1);
            RETURN;
        END
        IF @Quantity IS NULL OR @Quantity < 0 SET @Quantity = 1;
        IF @IdealFor IS NULL OR LEN(@IdealFor) = 0 SET @IdealFor = 'ALL';
        IF @ActualCost IS NULL OR @ActualCost < 0 SET @ActualCost = ISNULL(@Price, 0.00);
        IF @Priority IS NULL SET @Priority = 0;
        IF @Color IS NULL OR LEN(@Color) = 0 SET @Color = 'Silver';
        IF @Review IS NULL SET @Review = 0;
        IF @Sold IS NULL SET @Sold = 0;

        IF @InputProductId IS NOT NULL AND @InputProductId > 0
        BEGIN
            IF EXISTS (SELECT 1 FROM dbo.product WHERE product_id = @InputProductId)
            BEGIN
                RAISERROR('Validation Error: Product with ID %d already exists.', 16, 1, @InputProductId);
                RETURN;
            END
            SET @NewProductId = @InputProductId;
        END
        ELSE
        BEGIN
            SELECT @NewProductId = ISNULL(MAX(product_id), 0) + 1 FROM dbo.product;
        END

        INSERT INTO dbo.product (
            product_id, category_id, m_id, purity, [weight], 
            title, [description], price, discount, quantity, 
            ideal_for, packaging, labour_cost, actual_cost, [priority],
            color, review, sold
        )
        VALUES (
            @NewProductId, @CategoryId, @MakeId, @Purity, @Weight,
            @Title, @Description, @Price, @Discount, @Quantity,
            @IdealFor, @Packaging, @LabourCost, @ActualCost, @Priority,
            @Color, @Review, @Sold
        );

        SELECT @NewProductId AS NewProductId, 'Product added successfully' AS [Message];
    END

    -- RESTOCK
    ELSE IF @Opr = 'RESTOCK'
    BEGIN
        UPDATE dbo.product
        SET quantity = quantity + ISNULL(@Quantity, 0)
        WHERE product_id = @TargetId;

        SELECT @TargetId AS ProductId, 'Stock restocked successfully' AS [Message];
    END

    -- EDIT
    ELSE IF @Opr = 'EDIT'
    BEGIN
        IF @CategoryId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.category WHERE category_id = @CategoryId)
        BEGIN
            RAISERROR('Validation Error: CategoryId %d does not exist in dbo.category.', 16, 1, @CategoryId);
            RETURN;
        END
        IF @MakeId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.make_master WHERE m_id = @MakeId)
        BEGIN
            RAISERROR('Validation Error: m_id %d does not exist in dbo.make_master.', 16, 1, @MakeId);
            RETURN;
        END

        UPDATE dbo.product
        SET category_id   = ISNULL(@CategoryId, category_id),
            m_id          = CASE WHEN @MakeId IS NOT NULL THEN @MakeId ELSE m_id END,
            purity        = ISNULL(@Purity, purity),
            [weight]      = ISNULL(@Weight, [weight]),
            title         = ISNULL(@Title, title),
            [description] = ISNULL(@Description, [description]),
            price         = ISNULL(@Price, price),
            discount      = CASE WHEN @Discount IS NOT NULL THEN @Discount ELSE discount END,
            quantity      = ISNULL(@Quantity, quantity),
            ideal_for     = ISNULL(@IdealFor, ideal_for),
            packaging     = CASE WHEN @Packaging IS NOT NULL THEN @Packaging ELSE packaging END,
            labour_cost   = CASE WHEN @LabourCost IS NOT NULL THEN @LabourCost ELSE labour_cost END,
            actual_cost   = ISNULL(@ActualCost, actual_cost),
            [priority]    = ISNULL(@Priority, [priority]),
            color         = ISNULL(@Color, color),
            review        = CASE WHEN @Review IS NOT NULL THEN @Review ELSE review END,
            sold          = CASE WHEN @Sold IS NOT NULL THEN @Sold ELSE sold END
        WHERE product_id = @TargetId;

        SELECT @TargetId AS ProductId, 'Product updated successfully' AS [Message];
    END

    -- DELETE
    ELSE IF @Opr = 'DELETE'
    BEGIN
        BEGIN TRANSACTION;
        BEGIN TRY
            DECLARE @ImagesToDelete TABLE (image_id INT);

            INSERT INTO @ImagesToDelete (image_id)
            SELECT image_id 
            FROM dbo.product_image 
            WHERE product_id = @TargetId;

            DELETE FROM dbo.product_image 
            WHERE product_id = @TargetId;

            DELETE FROM dbo.[image]
            WHERE image_id IN (SELECT image_id FROM @ImagesToDelete)
              AND image_id NOT IN (SELECT image_id FROM dbo.product_image);

            DELETE FROM dbo.product 
            WHERE product_id = @TargetId;

            COMMIT TRANSACTION;
            SELECT @TargetId AS ProductId, 'Product and all associated data deleted successfully' AS [Message];
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END

    -- SELECT
    ELSE IF @Opr = 'SELECT'
    BEGIN
        SELECT 
            p.product_id,
            p.title AS product_name,
            p.title AS title,
            p.title AS name,
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
        WHERE (@TargetId IS NULL OR p.product_id = @TargetId);
    END
END;
GO
-- =========================================================================
-- PROCEDURE 2: SP_category
-- =========================================================================
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

    IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
    BEGIN
        SELECT
            @Name        = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.name'))),
            @Description = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.description'))),
            @Slug        = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.slug'))),
            @IdealFor    = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.ideal_for')));

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
            SELECT category_id, [name], [description], slug, ideal_for 
            FROM dbo.category 
            WHERE category_id = @TargetId;
        ELSE
            SELECT category_id, [name], [description], slug, ideal_for 
            FROM dbo.category;
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

        INSERT INTO dbo.category (category_id, [name], [description], slug, ideal_for)
        VALUES (@NewCategoryId, @Name, @Description, @Slug, @IdealFor);

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
            ideal_for     = CASE WHEN @IdealFor IS NOT NULL THEN @IdealFor ELSE ideal_for END
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
GO

-- =========================================================================
-- PROCEDURE 3: SP_image
-- =========================================================================
CREATE PROCEDURE dbo.SP_image
    @Opr       NVARCHAR(10),
    @JSONstr   NVARCHAR(MAX) = NULL,
    @Condition NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TargetId INT = TRY_CAST(@Condition AS INT);
    DECLARE @ImageUrl VARCHAR(500);
    DECLARE @NewImageId INT;

    IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
    BEGIN
        SELECT
            @ImageUrl = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.image_url')));
    END

    IF @Opr IN ('EDIT', 'DELETE')
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM dbo.[image] WHERE image_id = @TargetId)
        BEGIN
            RAISERROR('Not Found: Image with ID %d does not exist.', 16, 1, @TargetId);
            RETURN;
        END
    END

    IF @Opr = 'SELECT'
    BEGIN
        IF @TargetId IS NOT NULL AND @TargetId > 0
            SELECT image_id, image_url 
            FROM dbo.[image] 
            WHERE image_id = @TargetId;
        ELSE
            SELECT image_id, image_url 
            FROM dbo.[image];
    END

    ELSE IF @Opr = 'ADD'
    BEGIN
        IF @ImageUrl IS NULL OR LEN(@ImageUrl) = 0
        BEGIN
            RAISERROR('Validation Error: image_url cannot be blank.', 16, 1);
            RETURN;
        END

        SELECT @NewImageId = ISNULL(MAX(image_id), 0) + 1 FROM dbo.[image];

        INSERT INTO dbo.[image] (image_id, image_url)
        VALUES (@NewImageId, @ImageUrl);

        SELECT @NewImageId AS NewImageId, 'Image added successfully' AS [Message];
    END

    ELSE IF @Opr = 'EDIT'
    BEGIN
        IF @ImageUrl IS NULL OR LEN(@ImageUrl) = 0
        BEGIN
            RAISERROR('Validation Error: image_url cannot be blank on update.', 16, 1);
            RETURN;
        END

        UPDATE dbo.[image]
        SET image_url = @ImageUrl
        WHERE image_id = @TargetId;

        SELECT @TargetId AS ImageId, 'Image updated successfully' AS [Message];
    END

    ELSE IF @Opr = 'DELETE'
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.product_image WHERE image_id = @TargetId)
        BEGIN
            RAISERROR('Constraint Error: Cannot delete image because it is linked in dbo.product_image.', 16, 1);
            RETURN;
        END

        DELETE FROM dbo.[image] WHERE image_id = @TargetId;
        SELECT @TargetId AS ImageId, 'Image deleted successfully' AS [Message];
    END
END;
GO

-- =========================================================================
-- PROCEDURE 4: SP_make_master
-- =========================================================================
CREATE PROCEDURE dbo.SP_make_master
    @Opr       NVARCHAR(10),
    @JSONstr   NVARCHAR(MAX) = NULL,
    @Condition NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TargetId INT = TRY_CAST(@Condition AS INT);
    DECLARE @NewMakeId INT;
    DECLARE @Type VARCHAR(50);

    IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
    BEGIN
        SELECT
            @Type = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.type')));
    END

    IF @Opr IN ('EDIT', 'DELETE')
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM dbo.make_master WHERE m_id = @TargetId)
        BEGIN
            RAISERROR('Not Found: Make entry with ID %d does not exist.', 16, 1, @TargetId);
            RETURN;
        END
    END

    IF @Opr = 'SELECT'
    BEGIN
        IF @TargetId IS NOT NULL AND @TargetId > 0
            SELECT m_id, [type] FROM dbo.make_master WHERE m_id = @TargetId;
        ELSE
            SELECT m_id, [type] FROM dbo.make_master;
    END

    ELSE IF @Opr = 'ADD'
    BEGIN
        IF @Type IS NULL OR LEN(@Type) = 0
        BEGIN
            RAISERROR('Validation Error: type cannot be blank.', 16, 1);
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM dbo.make_master WHERE [type] = @Type)
        BEGIN
            RAISERROR('Validation Error: Type "%s" already exists in make_master.', 16, 1, @Type);
            RETURN;
        END

        SELECT @NewMakeId = ISNULL(MAX(m_id), 0) + 1 FROM dbo.make_master;

        INSERT INTO dbo.make_master (m_id, [type])
        VALUES (@NewMakeId, @Type);

        SELECT @NewMakeId AS NewMakeId, 'Make entry added successfully' AS [Message];
    END

    ELSE IF @Opr = 'EDIT'
    BEGIN
        IF @Type IS NULL OR LEN(@Type) = 0
        BEGIN
            RAISERROR('Validation Error: type cannot be blank on update.', 16, 1);
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM dbo.make_master WHERE [type] = @Type AND m_id <> @TargetId)
        BEGIN
            RAISERROR('Validation Error: Type "%s" already exists.', 16, 1, @Type);
            RETURN;
        END

        UPDATE dbo.make_master
        SET [type] = @Type
        WHERE m_id = @TargetId;

        SELECT @TargetId AS MakeId, 'Make entry updated successfully' AS [Message];
    END

    ELSE IF @Opr = 'DELETE'
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.product WHERE m_id = @TargetId)
        BEGIN
            RAISERROR('Constraint Error: Cannot delete make entry because products reference it.', 16, 1);
            RETURN;
        END

        DELETE FROM dbo.make_master WHERE m_id = @TargetId;
        SELECT @TargetId AS MakeId, 'Make entry deleted successfully' AS [Message];
    END
END;
GO

-- =========================================================================
-- PROCEDURE 5: SP_product_image
-- =========================================================================
CREATE PROCEDURE dbo.SP_product_image
    @Opr       NVARCHAR(10),
    @JSONstr   NVARCHAR(MAX) = NULL,
    @Condition NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TargetProductId INT = TRY_CAST(@Condition AS INT);
    DECLARE @ProductId INT;
    DECLARE @ImageId INT;

    IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
    BEGIN
        SELECT
            @ProductId = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.product_id') AS INT),
            @ImageId   = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.image_id') AS INT);
    END

    IF @ProductId IS NULL AND @TargetProductId IS NOT NULL
        SET @ProductId = @TargetProductId;

    IF @Opr = 'SELECT'
    BEGIN
        IF @TargetProductId IS NOT NULL AND @TargetProductId > 0
        BEGIN
            SELECT 
                pi.product_id,
                p.title AS product_name,
                pi.image_id,
                img.image_url
            FROM dbo.product_image pi
            INNER JOIN dbo.product p ON pi.product_id = p.product_id
            INNER JOIN dbo.[image] img ON pi.image_id = img.image_id
            WHERE pi.product_id = @TargetProductId;
        END
        ELSE
        BEGIN
            SELECT 
                pi.product_id,
                p.title AS product_name,
                pi.image_id,
                img.image_url
            FROM dbo.product_image pi
            INNER JOIN dbo.product p ON pi.product_id = p.product_id
            INNER JOIN dbo.[image] img ON pi.image_id = img.image_id;
        END
    END

    ELSE IF @Opr = 'ADD'
    BEGIN
        IF @ProductId IS NULL OR @ProductId <= 0
        BEGIN
            RAISERROR('Validation Error: A valid product_id is required.', 16, 1);
            RETURN;
        END

        IF @ImageId IS NULL OR @ImageId <= 0
        BEGIN
            RAISERROR('Validation Error: A valid image_id is required.', 16, 1);
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM dbo.product WHERE product_id = @ProductId)
        BEGIN
            RAISERROR('Validation Error: Product ID %d does not exist.', 16, 1, @ProductId);
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM dbo.[image] WHERE image_id = @ImageId)
        BEGIN
            RAISERROR('Validation Error: Image ID %d does not exist.', 16, 1, @ImageId);
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @ProductId AND image_id = @ImageId)
        BEGIN
            RAISERROR('Validation Error: This image is already mapped to the specified product.', 16, 1);
            RETURN;
        END

        INSERT INTO dbo.product_image (product_id, image_id)
        VALUES (@ProductId, @ImageId);

        SELECT @ProductId AS ProductId, @ImageId AS ImageId, 'Product image mapped successfully' AS [Message];
    END

    ELSE IF @Opr = 'DELETE'
    BEGIN
        IF @ProductId IS NOT NULL AND @ImageId IS NOT NULL
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM dbo.product_image WHERE product_id = @ProductId AND image_id = @ImageId)
            BEGIN
                RAISERROR('Not Found: Mapping for Product ID %d and Image ID %d does not exist.', 16, 1, @ProductId, @ImageId);
                RETURN;
            END

            DELETE FROM dbo.product_image WHERE product_id = @ProductId AND image_id = @ImageId;
            SELECT @ProductId AS ProductId, @ImageId AS ImageId, 'Mapping removed successfully' AS [Message];
        END
        ELSE IF @TargetProductId IS NOT NULL
        BEGIN
            DELETE FROM dbo.product_image WHERE product_id = @TargetProductId;
            SELECT @TargetProductId AS ProductId, 'All images unmapped for product' AS [Message];
        END
        ELSE
        BEGIN
            RAISERROR('Validation Error: product_id and image_id are required for delete.', 16, 1);
            RETURN;
        END
    END
    ELSE
    BEGIN
        RAISERROR('Validation Error: Operation "%s" is not supported for product_image.', 16, 1, @Opr);
        RETURN;
    END
END;
GO

-- =========================================================================
-- PROCEDURE 6: SP_User
-- =========================================================================
CREATE PROCEDURE dbo.SP_user
    @Opr       NVARCHAR(10),
    @JSONstr   NVARCHAR(MAX) = NULL,
    @Condition NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TargetUserId INT = TRY_CAST(@Condition AS INT);
    DECLARE @FullName NVARCHAR(100);
    DECLARE @Email NVARCHAR(150);
    DECLARE @Phone NVARCHAR(20);
    DECLARE @PasswordHash NVARCHAR (255);
    DECLARE @Role NVARCHAR(20);

    IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
    BEGIN
        SELECT
            @FullName        = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.full_name'))),
            @Email = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.email'))),
            @Phone       = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.phone'))),
            @PasswordHash    = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.password_hash'))),
            @Role    = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.role')));
    END

    IF @Opr ='Select'
    BEGIN
       IF @TargetUserId IS NOT NULL AND @TargetUserId > 0
        BEGIN
            SELECT user_id, full_name, email, phone, [role], created_at
            FROM dbo.[user]
            WHERE user_id = @TargetUserId;
        END
        ELSE IF @Email IS NOT NULL AND @Email <> ''
        BEGIN
            SELECT user_id, full_name, email, phone, password_hash, [role], created_at
            FROM dbo.[user]
            WHERE email = @Email;
        END
        ELSE
        BEGIN
            SELECT user_id, full_name, email, phone, [role], created_at
            FROM dbo.[user]
            ORDER BY user_id DESC;
        END
        RETURN;
    END
    IF @Opr='ADD'
    BEGIN
        IF @FullName IS NULL OR LEN(@FullName) = 0
        BEGIN
            RAISERROR('Validation Error: full_name cannot be blank.', 16, 1);
            RETURN;
        END
        IF @Email IS NULL OR LEN(@Email) = 0
        BEGIN
            RAISERROR('Validation Error: email cannot be blank.', 16, 1);
            RETURN;
        END
        IF @PasswordHash IS NULL OR LEN(@PasswordHash) = 0
        BEGIN
            RAISERROR('Validation Error: password_hash cannot be blank.', 16, 1);
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM dbo.[user] WHERE email = @Email)
        BEGIN
            RAISERROR('Validation Error: An account with this email already exists.', 16, 1);
            RETURN;
        END

        IF @Role IS NULL OR @Role = '' SET @Role = 'CUSTOMER';

        INSERT INTO dbo.[user] (full_name, email, phone, password_hash, [role])
        VALUES (@FullName, @Email, @Phone, @PasswordHash, @Role);

        DECLARE @NewUserId INT = SCOPE_IDENTITY();
        SELECT @NewUserId AS user_id, 'User registered successfully' AS [Message];
        RETURN;
    END

    IF @Opr='Edit'
    BEGIN
        IF @TargetUserId IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.[user] WHERE user_id = @TargetUserId)
        BEGIN
            RAISERROR('Not Found: User with ID %d does not exist.', 16, 1, @TargetUserId);
            RETURN;
        END

        IF @Email IS NOT NULL AND EXISTS (SELECT 1 FROM dbo.[user] WHERE email = @Email AND user_id <> @TargetUserId)
        BEGIN
            RAISERROR('Validation Error: Email is already taken by another account.', 16, 1);
            RETURN;
        END

        UPDATE dbo.[user]
        SET full_name     = ISNULL(@FullName, full_name),
            email         = ISNULL(@Email, email),
            phone         = ISNULL(@Phone, phone),
            password_hash = ISNULL(@PasswordHash, password_hash),
            [role]        = ISNULL(@Role, [role])
        WHERE user_id = @TargetUserId;

        SELECT @TargetUserId AS user_id, 'User profile updated successfully' AS [Message];
        RETURN;
    END

    IF @Opr = 'DELETE'
    BEGIN
        IF @TargetUserId IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.[user] WHERE user_id = @TargetUserId)
        BEGIN
            RAISERROR('Not Found: User with ID %d does not exist.', 16, 1, @TargetUserId);
            RETURN;
        END

        DELETE FROM dbo.[user] WHERE user_id = @TargetUserId;
        SELECT @TargetUserId AS user_id, 'User deleted successfully' AS [Message];
        RETURN;
    END
END;
GO

-- =========================================================================
-- PROCEDURE 7: SP_address
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.SP_address
    @Opr       NVARCHAR(10),
    @JSONstr   NVARCHAR(MAX) = NULL,
    @Condition NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TargetAddressId INT = TRY_CAST(@Condition AS INT);
    DECLARE @UserId          INT;
    DECLARE @AddressName     NVARCHAR(20);
    DECLARE @RecipientName   NVARCHAR(100);
    DECLARE @Block           NVARCHAR(255);
    DECLARE @Street          NVARCHAR(255);
    DECLARE @Area            NVARCHAR(255);
    DECLARE @City            NVARCHAR(100);
    DECLARE @State           NVARCHAR(100);
    DECLARE @Pincode         NVARCHAR(10);
    DECLARE @Country         NVARCHAR(50);

    IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
    BEGIN
        SELECT
            @UserId        = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.user_id') AS INT),
            @AddressName   = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.address_name'))),
            @RecipientName = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.recipient_name'))),
            @Block         = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.Block'))),
            @Street        = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.street'))),
            @Area          = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.area'))),
            @City          = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.city'))),
            @State         = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.state'))),
            @Pincode       = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.pincode'))),
            @Country       = COALESCE(LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.country'))), 'India');
    END

    -- SELECT
    IF @Opr = 'SELECT'
    BEGIN
        IF @TargetAddressId IS NOT NULL AND @TargetAddressId > 0
        BEGIN
            SELECT address_id, user_id, address_name, recipient_name, Block, street, area, city, [state], pincode, country
            FROM dbo.address
            WHERE address_id = @TargetAddressId;
        END
        ELSE IF @UserId IS NOT NULL AND @UserId > 0
        BEGIN
            SELECT address_id, user_id, address_name, recipient_name, Block, street, area, city, [state], pincode, country
            FROM dbo.address
            WHERE user_id = @UserId
            ORDER BY address_id DESC;
        END
        ELSE
        BEGIN
            SELECT address_id, user_id, address_name, recipient_name, Block, street, area, city, [state], pincode, country
            FROM dbo.address
            ORDER BY address_id DESC;
        END
        RETURN;
    END

    -- ADD
    IF @Opr = 'ADD'
    BEGIN
        IF @UserId IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.[user] WHERE user_id = @UserId)
        BEGIN
            RAISERROR('Validation Error: A valid user_id is required.', 16, 1);
            RETURN;
        END
        IF @RecipientName IS NULL OR LEN(@RecipientName) = 0
        BEGIN
            RAISERROR('Validation Error: recipient_name cannot be blank.', 16, 1);
            RETURN;
        END
        IF @Block IS NULL OR LEN(@Block) = 0
        BEGIN
            RAISERROR('Validation Error: Block cannot be blank.', 16, 1);
            RETURN;
        END
        IF @Street IS NULL OR LEN(@Street) = 0
        BEGIN
            RAISERROR('Validation Error: street cannot be blank.', 16, 1);
            RETURN;
        END
        IF @Area IS NULL OR LEN(@Area) = 0
        BEGIN
            RAISERROR('Validation Error: area cannot be blank.', 16, 1);
            RETURN;
        END
        IF @City IS NULL OR LEN(@City) = 0
        BEGIN
            RAISERROR('Validation Error: city cannot be blank.', 16, 1);
            RETURN;
        END
        IF @State IS NULL OR LEN(@State) = 0
        BEGIN
            RAISERROR('Validation Error: state cannot be blank.', 16, 1);
            RETURN;
        END
        IF @Pincode IS NULL OR LEN(@Pincode) = 0
        BEGIN
            RAISERROR('Validation Error: pincode cannot be blank.', 16, 1);
            RETURN;
        END

        INSERT INTO dbo.address (user_id, address_name, recipient_name, Block, street, area, city, [state], pincode, country)
        VALUES (@UserId, @AddressName, @RecipientName, @Block, @Street, @Area, @City, @State, @Pincode, @Country);

        DECLARE @NewAddressId INT = SCOPE_IDENTITY();
        SELECT @NewAddressId AS address_id, 'Address saved successfully' AS [Message];
        RETURN;
    END

    -- EDIT
    IF @Opr = 'EDIT'
    BEGIN
        IF @TargetAddressId IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.address WHERE address_id = @TargetAddressId)
        BEGIN
            RAISERROR('Not Found: Address with ID %d does not exist.', 16, 1, @TargetAddressId);
            RETURN;
        END

        UPDATE dbo.address
        SET address_name   = ISNULL(@AddressName, address_name),
            recipient_name = ISNULL(@RecipientName, recipient_name),
            Block          = ISNULL(@Block, Block),
            street         = ISNULL(@Street, street),
            area           = ISNULL(@Area, area),
            city           = ISNULL(@City, city),
            [state]        = ISNULL(@State, [state]),
            pincode        = ISNULL(@Pincode, pincode),
            country        = ISNULL(@Country, country)
        WHERE address_id = @TargetAddressId;

        SELECT @TargetAddressId AS address_id, 'Address updated successfully' AS [Message];
        RETURN;
    END

    -- DELETE
    IF @Opr = 'DELETE'
    BEGIN
        IF @TargetAddressId IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.address WHERE address_id = @TargetAddressId)
        BEGIN
            RAISERROR('Not Found: Address with ID %d does not exist.', 16, 1, @TargetAddressId);
            RETURN;
        END

        DELETE FROM dbo.address WHERE address_id = @TargetAddressId;
        SELECT @TargetAddressId AS address_id, 'Address deleted successfully' AS [Message];
        RETURN;
    END
END;
GO

-- =========================================================================
-- PROCEDURE 8: SP_cart
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.SP_cart
    @Opr       NVARCHAR(10),
    @JSONstr   NVARCHAR(MAX) = NULL,
    @Condition NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TargetCartId INT = TRY_CAST(@Condition AS INT);
    DECLARE @UserId       INT;
    DECLARE @GuestToken   NVARCHAR(100);
    DECLARE @ProductId    INT;
    DECLARE @Quantity     INT = 1;

    IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
    BEGIN
        SELECT
            @UserId       = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.user_id') AS INT),
            @GuestToken   = LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.guest_token'))),
            @ProductId    = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.product_id') AS INT),
            @Quantity     = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.quantity') AS INT), 1),
            @TargetCartId = COALESCE(TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.cart_id') AS INT), @TargetCartId);
    END

    -- Resolve Cart ID
    DECLARE @CartId INT = @TargetCartId;
    IF @CartId IS NULL
    BEGIN
        IF @UserId IS NOT NULL AND @UserId > 0
        BEGIN
            SELECT TOP 1 @CartId = cart_id FROM dbo.cart WHERE user_id = @UserId;
            IF @CartId IS NULL
            BEGIN
                INSERT INTO dbo.cart (user_id, guest_token) VALUES (@UserId, NULL);
                SET @CartId = SCOPE_IDENTITY();
            END
        END
        ELSE IF @GuestToken IS NOT NULL AND @GuestToken <> ''
        BEGIN
            SELECT TOP 1 @CartId = cart_id FROM dbo.cart WHERE guest_token = @GuestToken;
            IF @CartId IS NULL
            BEGIN
                INSERT INTO dbo.cart (user_id, guest_token) VALUES (NULL, @GuestToken);
                SET @CartId = SCOPE_IDENTITY();
            END
        END
    END

    -- SELECT (Computes amount, discount, and final_rate from dbo.product)
    IF @Opr = 'SELECT'
    BEGIN
        IF @CartId IS NULL
        BEGIN
            SELECT 0 AS cart_id, 0 AS total_quantity, 0.00 AS cart_subtotal, 0.00 AS cart_total;
            RETURN;
        END

        SELECT 
            ci.cart_item_id,
            ci.cart_id,
            ci.product_id,
            p.title AS product_name,
            p.purity,
            p.[weight],
            p.price AS amount,
            ISNULL(p.discount, 0.00) AS discount,
            CAST(p.price - (p.price * ISNULL(p.discount, 0.00) / 100.0) AS DECIMAL(18,2)) AS final_rate,
            ci.quantity,
            CAST(CAST(p.price - (p.price * ISNULL(p.discount, 0.00) / 100.0) AS DECIMAL(18,2)) * ci.quantity AS DECIMAL(18,2)) AS line_total,
            ci.created_at,
            ISNULL((
                SELECT TOP 1 img.image_url
                FROM dbo.product_image pi
                INNER JOIN dbo.[image] img ON pi.image_id = img.image_id
                WHERE pi.product_id = ci.product_id
            ), '') AS image_url
        FROM dbo.cart_item ci
        INNER JOIN dbo.product p ON ci.product_id = p.product_id
        WHERE ci.cart_id = @CartId
        ORDER BY ci.cart_item_id DESC;

        RETURN;
    END

    -- ADD
    IF @Opr = 'ADD'
    BEGIN
        IF @CartId IS NULL
        BEGIN
            RAISERROR('Validation Error: user_id or guest_token is required to identify the cart.', 16, 1);
            RETURN;
        END

        IF @ProductId IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.product WHERE product_id = @ProductId)
        BEGIN
            RAISERROR('Validation Error: Valid product_id is required.', 16, 1);
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM dbo.cart_item WHERE cart_id = @CartId AND product_id = @ProductId)
        BEGIN
            UPDATE dbo.cart_item
            SET quantity = quantity + @Quantity
            WHERE cart_id = @CartId AND product_id = @ProductId;
        END
        ELSE
        BEGIN
            INSERT INTO dbo.cart_item (cart_id, product_id, quantity)
            VALUES (@CartId, @ProductId, @Quantity);
        END

        UPDATE dbo.cart SET updated_at = SYSUTCDATETIME() WHERE cart_id = @CartId;

        SELECT @CartId AS cart_id, @ProductId AS product_id, 'Product added to cart successfully' AS [Message];
        RETURN;
    END

    -- EDIT (Set quantity directly)
    IF @Opr = 'EDIT'
    BEGIN
        IF @CartId IS NULL OR @ProductId IS NULL
        BEGIN
            RAISERROR('Validation Error: cart_id and product_id are required.', 16, 1);
            RETURN;
        END

        IF @Quantity <= 0
        BEGIN
            DELETE FROM dbo.cart_item WHERE cart_id = @CartId AND product_id = @ProductId;
            SELECT @CartId AS cart_id, @ProductId AS product_id, 'Item removed from cart' AS [Message];
        END
        ELSE
        BEGIN
            UPDATE dbo.cart_item
            SET quantity = @Quantity
            WHERE cart_id = @CartId AND product_id = @ProductId;

            UPDATE dbo.cart SET updated_at = SYSUTCDATETIME() WHERE cart_id = @CartId;
            SELECT @CartId AS cart_id, @ProductId AS product_id, @Quantity AS quantity, 'Quantity updated successfully' AS [Message];
        END
        RETURN;
    END

    -- DELETE (Single item or whole cart)
    IF @Opr = 'DELETE'
    BEGIN
        IF @CartId IS NULL
        BEGIN
            RAISERROR('Validation Error: cart_id is required.', 16, 1);
            RETURN;
        END

        IF @ProductId IS NOT NULL AND @ProductId > 0
        BEGIN
            DELETE FROM dbo.cart_item WHERE cart_id = @CartId AND product_id = @ProductId;
            SELECT @CartId AS cart_id, @ProductId AS product_id, 'Item removed from cart' AS [Message];
        END
        ELSE
        BEGIN
            DELETE FROM dbo.cart_item WHERE cart_id = @CartId;
            SELECT @CartId AS cart_id, 'Cart cleared completely' AS [Message];
        END

        UPDATE dbo.cart SET updated_at = SYSUTCDATETIME() WHERE cart_id = @CartId;
        RETURN;
    END

    -- MERGE (Guest cart to user cart on login)
    IF @Opr = 'MERGE'
    BEGIN
        IF @UserId IS NOT NULL AND @GuestToken IS NOT NULL AND @GuestToken <> ''
        BEGIN
            DECLARE @GuestCartId INT;
            SELECT TOP 1 @GuestCartId = cart_id FROM dbo.cart WHERE guest_token = @GuestToken;

            IF @GuestCartId IS NOT NULL
            BEGIN
                MERGE dbo.cart_item AS target
                USING (SELECT product_id, quantity FROM dbo.cart_item WHERE cart_id = @GuestCartId) AS source
                ON (target.cart_id = @CartId AND target.product_id = source.product_id)
                WHEN MATCHED THEN
                    UPDATE SET target.quantity = target.quantity + source.quantity
                WHEN NOT MATCHED THEN
                    INSERT (cart_id, product_id, quantity)
                    VALUES (@CartId, source.product_id, source.quantity);

                DELETE FROM dbo.cart WHERE cart_id = @GuestCartId;
            END

            SELECT @CartId AS cart_id, 'Guest cart merged successfully' AS [Message];
        END
        RETURN;
    END
END;
GO

-- =========================================================================
-- PROCEDURE 9: SP_orders
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.SP_orders
    @Opr       NVARCHAR(10),
    @JSONstr   NVARCHAR(MAX) = NULL,
    @Condition NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TargetOrderId  INT = TRY_CAST(@Condition AS INT);
    DECLARE @UserId         INT;
    DECLARE @AddressId      INT;
    DECLARE @PaymentStatus  NVARCHAR(20);
    DECLARE @OrderNumber    NVARCHAR(50);
    DECLARE @CartId         INT;

    IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
    BEGIN
        SELECT
            @UserId        = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.user_id') AS INT),
            @AddressId     = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.address_id') AS INT),
            @PaymentStatus = COALESCE(LTRIM(RTRIM(JSON_VALUE(@JSONstr, '$.table_values.payment_status'))), 'PENDING'),
            @CartId        = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.cart_id') AS INT);
    END

    -- SELECT
    IF @Opr = 'SELECT'
    BEGIN
        IF @TargetOrderId IS NOT NULL AND @TargetOrderId > 0
        BEGIN
            SELECT 
                o.order_id, o.order_number, o.user_id, u.full_name AS customer_name, u.email,
                o.address_id, a.recipient_name, a.Block, a.street, a.area, a.city, a.[state], a.pincode, a.country,
                o.total_amount, o.discount_amount, o.final_payable, o.payment_status, o.created_at,
                (
                    SELECT 
                        oi.order_item_id, oi.product_id, p.title AS product_name,
                        oi.unit_price, oi.discount_percent, oi.quantity, oi.subtotal
                    FROM dbo.order_item oi
                    INNER JOIN dbo.product p ON oi.product_id = p.product_id
                    WHERE oi.order_id = o.order_id
                    FOR JSON PATH
                ) AS items_json
            FROM dbo.orders o
            INNER JOIN dbo.[user] u ON o.user_id = u.user_id
            LEFT JOIN dbo.address a ON o.address_id = a.address_id
            WHERE o.order_id = @TargetOrderId;
        END
        ELSE IF @UserId IS NOT NULL AND @UserId > 0
        BEGIN
            SELECT 
                o.order_id, o.order_number, o.user_id,
                o.total_amount, o.discount_amount, o.final_payable, o.payment_status, o.created_at
            FROM dbo.orders o
            WHERE o.user_id = @UserId
            ORDER BY o.order_id DESC;
        END
        ELSE
        BEGIN
            SELECT 
                o.order_id, o.order_number, o.user_id, u.full_name AS customer_name,
                o.total_amount, o.discount_amount, o.final_payable, o.payment_status, o.created_at
            FROM dbo.orders o
            INNER JOIN dbo.[user] u ON o.user_id = u.user_id
            ORDER BY o.order_id DESC;
        END
        RETURN;
    END

    -- ADD (Convert Cart to Order)
    IF @Opr = 'ADD'
    BEGIN
        IF @UserId IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.[user] WHERE user_id = @UserId)
        BEGIN
            RAISERROR('Validation Error: A valid user_id is required.', 16, 1);
            RETURN;
        END

        IF @AddressId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.address WHERE address_id = @AddressId)
        BEGIN
            RAISERROR('Validation Error: Provided address_id does not exist.', 16, 1);
            RETURN;
        END

        -- If cart_id wasn't explicitly supplied, find user's cart
        IF @CartId IS NULL
            SELECT TOP 1 @CartId = cart_id FROM dbo.cart WHERE user_id = @UserId;

        IF @CartId IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.cart_item WHERE cart_id = @CartId)
        BEGIN
            RAISERROR('Validation Error: Cannot place an order with an empty cart.', 16, 1);
            RETURN;
        END

        -- Generate Order Number (e.g., SH-20260903-XXXX)
        SET @OrderNumber = 'SH-' + CONVERT(VARCHAR(8), GETDATE(), 112) + '-' + RIGHT(CAST(NEWID() AS VARCHAR(36)), 4);

        DECLARE @TotalAmount     DECIMAL(18,2) = 0.00;
        DECLARE @DiscountAmount  DECIMAL(18,2) = 0.00;
        DECLARE @FinalPayable    DECIMAL(18,2) = 0.00;

        SELECT 
            @TotalAmount    = SUM(p.price * ci.quantity),
            @FinalPayable   = SUM(CAST(p.price - (p.price * ISNULL(p.discount, 0.00) / 100.0) AS DECIMAL(18,2)) * ci.quantity)
        FROM dbo.cart_item ci
        INNER JOIN dbo.product p ON ci.product_id = p.product_id
        WHERE ci.cart_id = @CartId;

        SET @DiscountAmount = @TotalAmount - @FinalPayable;

        BEGIN TRANSACTION;
        BEGIN TRY
            -- 1. Insert into orders
            INSERT INTO dbo.orders (order_number, user_id, address_id, total_amount, discount_amount, final_payable, payment_status)
            VALUES (@OrderNumber, @UserId, @AddressId, @TotalAmount, @DiscountAmount, @FinalPayable, @PaymentStatus);

            DECLARE @NewOrderId INT = SCOPE_IDENTITY();

            -- 2. Insert into order_item (Snapshot live price and discount)
            INSERT INTO dbo.order_item (order_id, product_id, unit_price, discount_percent, quantity, subtotal)
            SELECT 
                @NewOrderId,
                ci.product_id,
                p.price,
                ISNULL(p.discount, 0.00),
                ci.quantity,
                CAST(CAST(p.price - (p.price * ISNULL(p.discount, 0.00) / 100.0) AS DECIMAL(18,2)) * ci.quantity AS DECIMAL(18,2))
            FROM dbo.cart_item ci
            INNER JOIN dbo.product p ON ci.product_id = p.product_id
            WHERE ci.cart_id = @CartId;

            -- 3. Decrement Product Stock
            UPDATE p
            SET p.quantity = p.quantity - ci.quantity
            FROM dbo.product p
            INNER JOIN dbo.cart_item ci ON p.product_id = ci.product_id
            WHERE ci.cart_id = @CartId;

            -- 4. Clear Cart
            DELETE FROM dbo.cart_item WHERE cart_id = @CartId;

            COMMIT TRANSACTION;

            SELECT @NewOrderId AS order_id, @OrderNumber AS order_number, @FinalPayable AS final_payable, 'Order placed successfully' AS [Message];
            RETURN;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END

    -- EDIT (Update Payment Status)
    IF @Opr = 'EDIT'
    BEGIN
        IF @TargetOrderId IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.orders WHERE order_id = @TargetOrderId)
        BEGIN
            RAISERROR('Not Found: Order with ID %d does not exist.', 16, 1, @TargetOrderId);
            RETURN;
        END

        UPDATE dbo.orders
        SET payment_status = ISNULL(@PaymentStatus, payment_status)
        WHERE order_id = @TargetOrderId;

        SELECT @TargetOrderId AS order_id, 'Order updated successfully' AS [Message];
        RETURN;
    END
END;
GO

-- =========================================================================
-- PROCEDURE 10: SP_wishlist
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.SP_wishlist
    @Opr       NVARCHAR(10),
    @JSONstr   NVARCHAR(MAX) = NULL,
    @Condition NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserId    INT;
    DECLARE @ProductId INT;

    IF @JSONstr IS NOT NULL AND ISJSON(@JSONstr) > 0
    BEGIN
        SELECT
            @UserId    = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.user_id') AS INT),
            @ProductId = TRY_CAST(JSON_VALUE(@JSONstr, '$.table_values.product_id') AS INT);
    END

    -- SELECT
    IF @Opr = 'SELECT'
    BEGIN
        IF @UserId IS NULL OR @UserId <= 0
            SET @UserId = TRY_CAST(@Condition AS INT);

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
        WHERE (@UserId IS NULL OR w.user_id = @UserId)
        ORDER BY w.wishlist_id DESC;

        RETURN;
    END

    -- ADD
    IF @Opr = 'ADD'
    BEGIN
        IF @UserId IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.[user] WHERE user_id = @UserId)
        BEGIN
            RAISERROR('Validation Error: Valid user_id is required.', 16, 1);
            RETURN;
        END

        IF @ProductId IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.product WHERE product_id = @ProductId)
        BEGIN
            RAISERROR('Validation Error: Valid product_id is required.', 16, 1);
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM dbo.wishlist WHERE user_id = @UserId AND product_id = @ProductId)
        BEGIN
            INSERT INTO dbo.wishlist (user_id, product_id)
            VALUES (@UserId, @ProductId);
        END

        SELECT @UserId AS user_id, @ProductId AS product_id, 'Added to wishlist' AS [Message];
        RETURN;
    END

    -- DELETE
    IF @Opr = 'DELETE'
    BEGIN
        IF @UserId IS NOT NULL AND @ProductId IS NOT NULL
        BEGIN
            DELETE FROM dbo.wishlist WHERE user_id = @UserId AND product_id = @ProductId;
            SELECT @ProductId AS product_id, 'Removed from wishlist' AS [Message];
        END
        ELSE
        BEGIN
            DECLARE @TargetWishlistId INT = TRY_CAST(@Condition AS INT);
            DELETE FROM dbo.wishlist WHERE wishlist_id = @TargetWishlistId;
            SELECT @TargetWishlistId AS wishlist_id, 'Removed from wishlist' AS [Message];
        END
        RETURN;
    END
END;
GO

-- =========================================================================
-- PROCEDURE 11: SP_GETDATA
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.SP_GETDATA
    @proc_name   NVARCHAR(50),
    @Opr         NVARCHAR(10),
    @JSONstr     NVARCHAR(MAX) = NULL,
    @Condition   NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Response NVARCHAR(MAX) = 'OK';

    SET @proc_name = LOWER(LTRIM(RTRIM(@proc_name)));
    SET @Opr = UPPER(LTRIM(RTRIM(@Opr)));

    IF @proc_name IS NULL OR @proc_name = ''
    BEGIN
        SET @Response = 'ERROR: proc_name cannot be empty.';
        SELECT @Response AS [Response_Status];
        RETURN;
    END

    -- Whitelist includes catalog entities and new e-commerce entities
    IF @proc_name NOT IN ('product', 'category', 'image', 'make_master', 'product_image', 'user', 'address', 'cart', 'orders', 'wishlist')
    BEGIN
        SET @Response = 'SECURITY ERROR: Unauthorized or unsupported proc_name "' + @proc_name + '".';
        SELECT @Response AS [Response_Status];
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @proc_name)
    BEGIN
        SET @Response = 'DATABASE ERROR: Target table "' + @proc_name + '" does not exist in schema.';
        SELECT @Response AS [Response_Status];
        RETURN;
    END

    -- Allow standard CRUD + RESTOCK and MERGE operations
    IF @Opr NOT IN ('ADD', 'EDIT', 'DELETE', 'SELECT', 'RESTOCK', 'MERGE')
    BEGIN
        SET @Response = 'VALIDATION ERROR: Invalid operation "' + @Opr + '". Allowed: ADD, EDIT, DELETE, SELECT, RESTOCK, MERGE.';
        SELECT @Response AS [Response_Status];
        RETURN;
    END

    IF @Opr IN ('ADD', 'RESTOCK')
    BEGIN
        IF @JSONstr IS NULL OR ISJSON(@JSONstr) = 0
        BEGIN
            SET @Response = 'VALIDATION ERROR: A valid JSON payload (JSONstr) is required for ' + @Opr + ' operations.';
            SELECT @Response AS [Response_Status];
            RETURN;
        END
    END

    BEGIN TRY
        IF @proc_name = 'product'
            EXEC dbo.SP_product @Opr = @Opr, @JSONstr = @JSONstr, @Condition = @Condition;
        ELSE IF @proc_name = 'category'
            EXEC dbo.SP_category @Opr = @Opr, @JSONstr = @JSONstr, @Condition = @Condition;
        ELSE IF @proc_name = 'image'
            EXEC dbo.SP_image @Opr = @Opr, @JSONstr = @JSONstr, @Condition = @Condition;
        ELSE IF @proc_name = 'make_master'
            EXEC dbo.SP_make_master @Opr = @Opr, @JSONstr = @JSONstr, @Condition = @Condition;
        ELSE IF @proc_name = 'product_image'
            EXEC dbo.SP_product_image @Opr = @Opr, @JSONstr = @JSONstr, @Condition = @Condition;
        ELSE IF @proc_name = 'user'
            EXEC dbo.SP_user @Opr = @Opr, @JSONstr = @JSONstr, @Condition = @Condition;
        ELSE IF @proc_name = 'address'
            EXEC dbo.SP_address @Opr = @Opr, @JSONstr = @JSONstr, @Condition = @Condition;
        ELSE IF @proc_name = 'cart'
            EXEC dbo.SP_cart @Opr = @Opr, @JSONstr = @JSONstr, @Condition = @Condition;
        ELSE IF @proc_name = 'orders'
            EXEC dbo.SP_orders @Opr = @Opr, @JSONstr = @JSONstr, @Condition = @Condition;
        ELSE IF @proc_name = 'wishlist'
            EXEC dbo.SP_wishlist @Opr = @Opr, @JSONstr = @JSONstr, @Condition = @Condition;

        SET @Response = 'OK';
        SELECT @Response AS [Response_Status];
    END TRY
    BEGIN CATCH
        SET @Response = 'ERROR [' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + ']: ' + ERROR_MESSAGE();
        SELECT @Response AS [Response_Status];
    END CATCH
END;
GO
