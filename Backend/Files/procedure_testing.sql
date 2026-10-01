USE SilverHouse;
GO

EXEC SP_GETDATA 
    @TableName = 'product', 
    @Opr = 'ADD', 
    @Payload = '{
        "table_values": {
            "category_id": 2,
            "title": "Classic Silver Band",
            "purity": "92.5 Sterling",
            "weight": "5.40 gm",
            "description": "Minimalist 925 sterling silver band ring",
            "price": 1499.00,
            "discount": 10.00,
            "quantity": 25,
            "ideal_for": "ALL",
            "packaging": "Velvet Box",
            "labour_cost": 250.00,
            "actual_cost": 1000.00
        }
    }';

EXEC SP_GETDATA 
    @TableName = 'category', 
    @Opr = 'ADD', 
    @Payload = '{"table_values": {"name": "Silver Pendants", "description": "Handcrafted 925 sterling silver pendants", "slug": "silver-pendants", "ideal_for": "Women"}}';

EXEC SP_GETDATA 
    @TableName = 'category', 
    @Opr = 'SELECT', 
    @Condition = '2';

EXEC SP_GETDATA 
    @TableName = 'category', 
    @Opr = 'EDIT', 
    @Payload = '{"table_values": {"description": "Updated handcrafted pure silver pendants", "ideal_for": "ALL"}}', 
    @Condition = '2';

EXEC SP_GETDATA 
    @TableName = 'category', 
    @Opr = 'DELETE', 
    @Condition = '3';

EXEC SP_GETDATA 
    @TableName = 'image', 
    @Opr = 'ADD', 
    @Payload = '{"table_values": {"image_url": "https://cdn.silverhouse.com/products/pendant-01.jpg"}}';

EXEC SP_GETDATA 
    @TableName = 'image', 
    @Opr = 'SELECT', 
    @Condition = '502';

EXEC SP_GETDATA 
    @TableName = 'image', 
    @Opr = 'EDIT', 
    @Payload = '{"table_values": {"image_url": "https://cdn.silverhouse.com/products/pendant-01-hd.jpg"}}', 
    @Condition = '503';

EXEC SP_GETDATA 
    @TableName = 'image', 
    @Opr = 'DELETE', 
    @Condition = '504';

EXEC SP_GETDATA 
    @TableName = 'product', 
    @Opr = 'SELECT', 
    @Condition = '103';

EXEC SP_GETDATA 
    @TableName = 'product', 
    @Opr = 'EDIT', 
    @Payload = '{
        "table_values": {
            "price": 1999.00,
            "discount": 10.00,
            "quantity": 20
        }
    }', 
    @Condition = '103';

EXEC SP_GETDATA @TableName = 'product', @Opr = 'SELECT';
EXEC SP_GETDATA @TableName = 'category', @Opr = 'SELECT';
EXEC SP_GETDATA @TableName = 'image', @Opr = 'SELECT';

USE SilverHouse;
GO

-- Category 1: Rings
EXEC SP_GETDATA 
    @TableName = 'category', 
    @Opr = 'ADD', 
    @Payload = '{"table_values": {"name": "Silver Rings", "description": "Pure 925 sterling silver finger rings", "slug": "silver-rings", "ideal_for": "Women"}}';

-- Category 2: Chains & Necklaces
EXEC SP_GETDATA 
    @TableName = 'category', 
    @Opr = 'ADD', 
    @Payload = '{"table_values": {"name": "Silver Chains", "description": "Classic and cuban sterling silver chains", "slug": "silver-chains", "ideal_for": "Men"}}';

-- Category 3: Bracelets
EXEC SP_GETDATA 
    @TableName = 'category', 
    @Opr = 'ADD', 
    @Payload = '{"table_values": {"name": "Silver Bracelets", "description": "Trendy charms and cuff bracelets", "slug": "silver-bracelets", "ideal_for": "Women"}}';

-- Category 4: Earrings
EXEC SP_GETDATA 
    @TableName = 'category', 
    @Opr = 'ADD', 
    @Payload = '{"table_values": {"name": "Silver Earrings", "description": "Studs, hoops, and dangler earrings", "slug": "silver-earrings", "ideal_for": "Women"}}';

-- Category 5: Coins & Idols
EXEC SP_GETDATA 
    @TableName = 'category', 
    @Opr = 'ADD', 
    @Payload = '{"table_values": {"name": "Pooja Articles & Idols", "description": "999 Pure silver coins and deity murti", "slug": "pooja-idols", "ideal_for": "ALL"}}';

-- Product for Rings Category (category_id = 4)
EXEC SP_GETDATA 
    @TableName = 'product', 
    @Opr = 'ADD', 
    @Payload = '{
        "table_values": {
            "category_id": 4,
            "title": "Solitaire Crystal Silver Ring",
            "purity": "92.5 Sterling",
            "weight": "3.20 gm",
            "description": "Adjustable sterling silver ring with solitaire crystal",
            "price": 1299.00,
            "discount": 5.00,
            "quantity": 35,
            "ideal_for": "Women",
            "packaging": "Ring Box",
            "labour_cost": 200.00,
            "actual_cost": 850.00
        }
    }';

-- Product for Chains Category (category_id = 5)
EXEC SP_GETDATA 
    @TableName = 'product', 
    @Opr = 'ADD', 
    @Payload = '{
        "table_values": {
            "category_id": 5,
            "title": "Cuban Link Silver Chain",
            "purity": "92.5 Sterling",
            "weight": "22.40 gm",
            "description": "Solid flat Cuban link chain with lobster clasp",
            "price": 5899.00,
            "discount": 10.00,
            "quantity": 15,
            "ideal_for": "Men",
            "packaging": "Long Velvet Box",
            "labour_cost": 800.00,
            "actual_cost": 4100.00
        }
    }';

-- Product for Bracelets Category (category_id = 6)
EXEC SP_GETDATA 
    @TableName = 'product', 
    @Opr = 'ADD', 
    @Payload = '{
        "table_values": {
            "category_id": 6,
            "title": "Infinity Link Silver Bracelet",
            "purity": "92.5 Sterling",
            "weight": "7.10 gm",
            "description": "Dainty silver chain bracelet with embedded cubic zirconia infinity symbol",
            "price": 2499.00,
            "discount": 12.00,
            "quantity": 25,
            "ideal_for": "Women",
            "packaging": "Pouch Box",
            "labour_cost": 350.00,
            "actual_cost": 1600.00
        }
    }';

-- Product for Earrings Category (category_id = 7)
EXEC SP_GETDATA 
    @TableName = 'product', 
    @Opr = 'ADD', 
    @Payload = '{
        "table_values": {
            "category_id": 7,
            "title": "Silver Floral Stud Earrings",
            "purity": "92.5 Sterling",
            "weight": "2.80 gm",
            "description": "Everyday wear handcrafted flower studs with push-back lock",
            "price": 999.00,
            "discount": 8.00,
            "quantity": 40,
            "ideal_for": "Women",
            "packaging": "Earring Box",
            "labour_cost": 150.00,
            "actual_cost": 650.00
        }
    }';

-- Product for Pooja Articles & Idols Category (category_id = 8)
EXEC SP_GETDATA 
    @TableName = 'product', 
    @Opr = 'ADD', 
    @Payload = '{
        "table_values": {
            "category_id": 8,
            "title": "999 Pure Silver Laxmi Coin 20g",
            "purity": "99.9 Pure",
            "weight": "20.00 gm",
            "description": "Hallmarked Lakshmi ji embossed round silver coin for Diwali & puja",
            "price": 2850.00,
            "discount": 0.00,
            "quantity": 50,
            "ideal_for": "ALL",
            "packaging": "Tamper Proof Blister Pack",
            "labour_cost": 250.00,
            "actual_cost": 2200.00
        }
    }';

USE SilverHouse;
GO

-- Add Make Types
EXEC dbo.SP_GETDATA 
    @proc_name = 'make_master', 
    @Opr = 'ADD', 
    @JSONstr = '{"table_values": {"type": "Handmade"}}';

EXEC dbo.SP_GETDATA 
    @proc_name = 'make_master', 
    @Opr = 'ADD', 
    @JSONstr = '{"table_values": {"type": "Machine Crafted"}}';

EXEC dbo.SP_GETDATA 
    @proc_name = 'make_master', 
    @Opr = 'ADD', 
    @JSONstr = '{"table_values": {"type": "Laser Cut"}}';

-- View All Make Records
EXEC dbo.SP_GETDATA 
    @proc_name = 'make_master', 
    @Opr = 'SELECT';


-- Add Image URLs
EXEC dbo.SP_GETDATA 
    @proc_name = 'image', 
    @Opr = 'ADD', 
    @JSONstr = '{"table_values": {"image_url": "https://cdn.silverhouse.com/products/bangle-set-front.jpg"}}';

EXEC dbo.SP_GETDATA 
    @proc_name = 'image', 
    @Opr = 'ADD', 
    @JSONstr = '{"table_values": {"image_url": "https://cdn.silverhouse.com/products/bangle-set-angle.jpg"}}';

EXEC dbo.SP_GETDATA 
    @proc_name = 'image', 
    @Opr = 'ADD', 
    @JSONstr = '{"table_values": {"image_url": "https://cdn.silverhouse.com/products/cufflinks-luxury.jpg"}}';

EXEC dbo.SP_GETDATA 
    @proc_name = 'image', 
    @Opr = 'ADD', 
    @JSONstr = '{"table_values": {"image_url": "https://cdn.silverhouse.com/products/silver-bowl-999.jpg"}}';

-- View All Images
EXEC dbo.SP_GETDATA 
    @proc_name = 'image', 
    @Opr = 'SELECT';

-- Map multiple images to Product 1
EXEC dbo.SP_GETDATA 
    @proc_name = 'product_image', 
    @Opr = 'ADD', 
    @JSONstr = '{"table_values": {"product_id": 102, "image_id": 502}}';

EXEC dbo.SP_GETDATA 
    @proc_name = 'product_image', 
    @Opr = 'ADD', 
    @JSONstr = '{"table_values": {"product_id": 103, "image_id": 502}}';

-- Map image to Product 2
EXEC dbo.SP_GETDATA 
    @proc_name = 'product_image', 
    @Opr = 'ADD', 
    @JSONstr = '{"table_values": {"product_id": 104, "image_id": 503}}';

-- Map image to Product 3
EXEC dbo.SP_GETDATA 
    @proc_name = 'product_image', 
    @Opr = 'ADD', 
    @JSONstr = '{"table_values": {"product_id": 105, "image_id": 504}}';

-- View all images linked specifically to Product ID 1
EXEC dbo.SP_GETDATA 
    @proc_name = 'product_image', 
    @Opr = 'SELECT', 
    @Condition = '103';

-- View all product-image mappings across the store
EXEC dbo.SP_GETDATA 
    @proc_name = 'product', 
    @Opr = 'SELECT';

-- ========================================================
-- REVIEW SYSTEM TESTING
-- ========================================================

-- 1. Insert review for product 1 with 5 stars and 2 photos
EXEC dbo.SP_GETDATA 
    @proc_name = 'review', 
    @Opr = 'INSERT', 
    @JSONstr = '{"table_values": {"productid": 1, "description": "Outstanding quality, pure solid silver!", "photo": "[\"https://example.com/payal1.jpg\", \"https://example.com/payal2.jpg\"]", "star": 5}}';

-- 2. Fetch all reviews for product 1 via SP_Fetchdata
EXEC dbo.SP_Fetchdata 
    @proc_name = 'review', 
    @Condition = '1';

-- 3. Fetch all reviews across the store
EXEC dbo.SP_Fetchdata 
    @proc_name = 'review';

-- 4. Update review (e.g. reviewid 1)
EXEC dbo.SP_GETDATA 
    @proc_name = 'review', 
    @Opr = 'EDIT', 
    @JSONstr = '{"table_values": {"reviewid": 1, "description": "Updated: Even better in real life!", "star": 5}}';

-- 5. Delete review
EXEC dbo.SP_GETDATA 
    @proc_name = 'review', 
    @Opr = 'DELETE', 
    @Condition = '1';