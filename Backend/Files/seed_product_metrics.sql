USE SilverHouse;
GO

-- 1. Ensure Columns Exist in dbo.product
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.product') AND name = 'color')
BEGIN
    ALTER TABLE dbo.product ADD color VARCHAR(50) NOT NULL DEFAULT 'Silver';
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.product') AND name = 'review')
BEGIN
    ALTER TABLE dbo.product ADD review INT NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.product') AND name = 'sold')
BEGIN
    ALTER TABLE dbo.product ADD sold INT NOT NULL DEFAULT 0;
END;
GO

-- 2. Populate / Update values for color, review, and sold across all products
UPDATE dbo.product 
SET 
    color = CASE 
        WHEN LOWER(title) LIKE '%rose gold%' THEN 'Rose Gold'
        WHEN LOWER(title) LIKE '%oxidised%' OR LOWER(title) LIKE '%antique%' THEN 'Oxidised'
        WHEN product_id % 3 = 1 THEN 'Silver'
        WHEN product_id % 3 = 2 THEN 'Rose Gold'
        ELSE 'Oxidised'
    END,
    review = CASE 
        WHEN review IS NULL OR review = 0 THEN (40 + (product_id * 17) % 250)
        ELSE review
    END,
    sold = CASE 
        WHEN sold IS NULL OR sold = 0 THEN (150 + (product_id * 83) % 2100)
        ELSE sold
    END;
GO

-- 3. Verification Query
SELECT product_id, title, price, color, review, sold 
FROM dbo.product 
ORDER BY sold DESC;
GO
