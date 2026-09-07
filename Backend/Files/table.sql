-- 1. Category Table
CREATE TABLE category (
    category_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    ideal_for VARCHAR(20) DEFAULT 'ALL'
);
GO

-- 2. Making Type Master (Optional: Handmade, Machine Made, Casting)
CREATE TABLE make_master (
    m_id INT PRIMARY KEY,
    type VARCHAR(50) NOT NULL
);
GO

-- 3. Product Table
CREATE TABLE product (
    product_id INT PRIMARY KEY,
    category_id INT NOT NULL,
    m_id INT,                                 
    purity VARCHAR(30) NOT NULL,
    weight VARCHAR(30) NOT NULL,
    title VARCHAR(50) NOT NULL,
    description VARCHAR(200) NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    discount DECIMAL(4, 2) DEFAULT 0,
    quantity INT NOT NULL,
    ideal_for VARCHAR(15) NOT NULL,
    packaging VARCHAR(50),
    labour_cost DECIMAL(18, 2) DEFAULT 0,
    actual_cost DECIMAL(18, 2) NOT NULL,
    color VARCHAR(50) DEFAULT 'Silver',
    review INT DEFAULT 0,
    sold INT DEFAULT 0,
    
    CONSTRAINT FK_product_category FOREIGN KEY (category_id) REFERENCES category(category_id),
    CONSTRAINT FK_product_make FOREIGN KEY (m_id) REFERENCES make_master(m_id)
);
GO

CREATE TABLE image (
    image_id INT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL
);

CREATE TABLE product_image (
    product_id INT NOT NULL,
    image_id INT NOT NULL,
    PRIMARY KEY (product_id, image_id),
    CONSTRAINT FK_pi_product FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE,
    CONSTRAINT FK_pi_image FOREIGN KEY (image_id) REFERENCES image(image_id) ON DELETE CASCADE
);


USE SilverHouse;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.product') AND name = 'priority'
)
BEGIN
    ALTER TABLE dbo.product ADD [priority] INT NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.product') AND name = 'color'
)
BEGIN
    ALTER TABLE dbo.product ADD color VARCHAR(50) NOT NULL DEFAULT 'Silver';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.product') AND name = 'review'
)
BEGIN
    ALTER TABLE dbo.product ADD review INT NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.product') AND name = 'sold'
)
BEGIN
    ALTER TABLE dbo.product ADD sold INT NOT NULL DEFAULT 0;
END
GO

-- 1. USER TABLE
IF OBJECT_ID('dbo.[user]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[user] (
        user_id INT IDENTITY(1,1) PRIMARY KEY,
        full_name NVARCHAR(100) NOT NULL,
        email NVARCHAR(150) NOT NULL UNIQUE,
        phone NVARCHAR(20) NULL,
        password_hash NVARCHAR(255) NOT NULL,
        [role] NVARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;
GO

-- 2. ADDRESS TABLE
IF OBJECT_ID('dbo.address', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.address (
        address_id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.[user](user_id) ON DELETE CASCADE,
        address_name NVARCHAR(20),
        recipient_name NVARCHAR(100) NOT NULL,
        Block NVARCHAR(255) NOT NULL,
        street NVARCHAR(255) NOT NULL,
        area NVARCHAR(255) NOT NULL,
        city NVARCHAR(100) NOT NULL,
        [state] NVARCHAR(100) NOT NULL,
        pincode NVARCHAR(10) NOT NULL,
        country NVARCHAR(50) NOT NULL DEFAULT 'India',
        );
END;
GO

-- 3. CART TABLE
IF OBJECT_ID('dbo.cart', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.cart (
        cart_id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NULL FOREIGN KEY REFERENCES dbo.[user](user_id) ON DELETE SET NULL,
        guest_token NVARCHAR(100) NULL,
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;
GO

-- 4. CART ITEM TABLE
IF OBJECT_ID('dbo.cart_item', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.cart_item (
        cart_item_id INT IDENTITY(1,1) PRIMARY KEY,
        cart_id INT NOT NULL FOREIGN KEY REFERENCES dbo.cart(cart_id) ON DELETE CASCADE,
        product_id INT NOT NULL FOREIGN KEY REFERENCES dbo.product(product_id),
        quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_cart_product UNIQUE (cart_id, product_id)
    );
END;
GO

-- 5. ORDERS TABLE
IF OBJECT_ID('dbo.orders', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.orders (
        order_id INT IDENTITY(1,1) PRIMARY KEY,
        order_number NVARCHAR(50) NOT NULL UNIQUE,
        user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.[user](user_id),
        address_id INT NULL FOREIGN KEY REFERENCES dbo.address(address_id),
        total_amount DECIMAL(18,2) NOT NULL,
        discount_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        final_payable DECIMAL(18,2) NOT NULL,
        payment_status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;
GO

-- 6. ORDER ITEM TABLE
IF OBJECT_ID('dbo.order_item', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.order_item (
        order_item_id INT IDENTITY(1,1) PRIMARY KEY,
        order_id INT NOT NULL FOREIGN KEY REFERENCES dbo.orders(order_id) ON DELETE CASCADE,
        product_id INT NOT NULL FOREIGN KEY REFERENCES dbo.product(product_id),
        unit_price DECIMAL(18,2) NOT NULL,
        discount_percent DECIMAL(4,2) NOT NULL DEFAULT 0.00,
        quantity INT NOT NULL CHECK (quantity > 0),
        subtotal DECIMAL(18,2) NOT NULL
    );
END;
GO

-- 7. WISHLIST TABLE
IF OBJECT_ID('dbo.wishlist', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.wishlist (
        wishlist_id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.[user](user_id) ON DELETE CASCADE,
        product_id INT NOT NULL FOREIGN KEY REFERENCES dbo.product(product_id) ON DELETE CASCADE,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_wishlist_user_product UNIQUE (user_id, product_id)
    );
END;
GO

