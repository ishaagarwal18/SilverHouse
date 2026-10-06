# SilverHouse API - Postman Collection & Environments

Official, production-grade Postman collection and environment definitions for the **SilverHouse** luxury pure silver e-commerce application and artisanal studio backend.

---

## 📦 What's Included

| File | Description |
| :--- | :--- |
| **`SilverHouse_API.postman_collection.json`** | Complete collection containing **71 ready-to-execute API requests** across **16 modular folders**. Conforms to Postman Collection v2.1.0 format. |
| **`SilverHouse_Local.postman_environment.json`** | Environment configured for local development (`http://localhost:5001`). |
| **`SilverHouse_Production.postman_environment.json`** | Environment configured for live production (`https://api.silverhouseindia.com`). |
| **`SilverHouse_Render.postman_environment.json`** | Environment configured for staging/cloud preview on Render (`https://silverhouse-backend.onrender.com`). |

*(A copy of `SilverHouse_API.postman_collection.json` is also available directly at `Backend/SilverHouse_API.postman_collection.json` for quick access).*

---

## 🚀 How to Import into Postman

1. Open **Postman**.
2. Click the **Import** button in the top-left corner (or press `Ctrl + O` / `Cmd + O`).
3. Drag and drop:
   - `Backend/postman/SilverHouse_API.postman_collection.json`
   - `Backend/postman/SilverHouse_Local.postman_environment.json`
   - `Backend/postman/SilverHouse_Production.postman_environment.json`
   - `Backend/postman/SilverHouse_Render.postman_environment.json`
4. In the top-right environment selector dropdown, choose **SilverHouse Local** (or **SilverHouse Production**).
5. Start testing!

---

## ⚡ Automated Authentication Chaining

You do **not** need to manually copy-paste Bearer tokens between requests. The collection includes Postman test scripts that automate the entire workflow:

### 1. Customer Authentication (`authToken`)
- Run request `01. Customer Authentication -> 1.1 Send WhatsApp OTP`.
  - For local/offline testing without WhatsApp charges, use the permanent test phone `9999999999` (static OTP: `123456`).
- Run request `01. Customer Authentication -> 1.2 Verify WhatsApp OTP & Login`.
- **Automatic Action**: The test script extracts `token` and `user.userId` from the JSON response and automatically saves them into:
  - `{{authToken}}`
  - `{{userId}}`
- All subsequent customer endpoints (Custom Orders, Cart, Wishlist, Addresses, Product Views, Reviews) immediately use this active token!

### 2. Admin Authentication (`adminToken`)
- Run request `02. Admin Portal & Authentication -> 2.1 Admin Credentials Login` (Default credentials: `username: admin`, `password: admin123`).
- **Automatic Action**: The test script extracts the admin JWT/token and saves it to:
  - `{{adminToken}}`
- All protected admin endpoints (Analytics, Custom Order Approval, Catalog Management, Parameters) immediately authenticate with this token!

---

## 📂 Collection Structure (71 Requests Across 16 Folders)

### 1. Customer Authentication (WhatsApp OTP)
- `1.1 Send WhatsApp OTP` (`POST /api/auth/send-otp`)
- `1.2 Verify WhatsApp OTP & Login` (`POST /api/auth/verify-otp`)
- `1.3 Get Current Active User Session` (`GET /api/auth/me`)
- `1.4 Update Customer Profile (POST)` (`POST /api/auth/profile`)
- `1.5 Update Customer Profile (PUT)` (`PUT /api/auth/profile`)
- `1.6 Legacy Customer Login Redirect` (`POST /api/auth/login`)
- `1.7 Legacy Customer Registration Redirect` (`POST /api/auth/register`)

### 2. Admin Portal & Authentication
- `2.1 Admin Credentials Login` (`POST /api/admin/login`)
- `2.2 Verify Admin Active Session` (`GET /api/admin/me`)
- `2.3 Change Admin Password` (`POST /api/admin/change-password`)

### 3. Custom Artisanal Orders (Bespoke Workflow)
- `3.1 Submit Custom Order Request` (`POST /api/custom-orders`) — Multi-file upload for reference photos
- `3.2 Customer Fetch My Custom Orders` (`GET /api/custom-orders/my-orders?userId={{userId}}`)
- `3.3 Customer Confirm & Pay Quotation` (`POST /api/custom-orders/:id/pay`)
- `3.4 Admin Fetch All Custom Orders` (`GET /api/admin/custom-orders?status=processing`)
- `3.5 Admin Update Quotation & Decision Status` (`PUT /api/admin/custom-orders/:id`) — Auto-sends customer WhatsApp updates

### 4. Admin Analytics & P&L
- `4.1 Get Full Analytics & P&L Dashboard` (`GET /api/admin/analytics`) — Real-time revenue potential, actual metal costs, labour costs, gross margins, and bespoke conversion rates

### 5. Recently Viewed Products
- `5.1 Record Product View` (`POST /api/viewed`) — Synchronizes to `dbo.viewed`
- `5.2 Fetch Recently Viewed (Logged-in Patron)` (`GET /api/viewed?userId={{userId}}`)
- `5.3 Fetch Recently Viewed (Guest Patron)` (`GET /api/viewed?productIds=1,2,3,4`)

### 6. Customer Reviews & Ratings
- `6.1 Submit Customer Review` (`POST /api/reviews`) — 1-5 star ratings, comments, and photos
- `6.2 Get Reviews for Product` (`GET /api/reviews?productId={{productId}}`) — Average ratings and customer feedback
- `6.3 Get Reviews for Specific Review ID` (`GET /api/reviews?reviewId=1`)

### 7. Store Parameters & Company Profile
- `7.1 Get Store Parameters` (`GET /api/parameters`) — Theme presets, WhatsApp API, festival banners
- `7.2 Update Store Parameters (Admin)` (`POST /api/admin/parameters`)
- `7.3 Get Official Company Details` (`GET /api/company`) — Official registered business data (Sunil K Agarwal, Ahmedabad, GST, PAN)

### 8. File & Media Uploads
- `8.1 Upload Single Image` (`POST /api/upload`) — Multipart image upload (`imageFile`)
- `8.2 Upload Multiple Images` (`POST /api/upload-multiple`) — Up to 10 images (`images`)

### 9. Data Gateway - Products (`POST /api/data` - `product`)
- `9.1 List All Products` (`opr: SELECT`)
- `9.2 Filter Products by Category, Price & Purity` (`opr: SELECT` with JSON filters)
- `9.3 Get Product by ID` (`opr: SELECT`, `condition: {{productId}}`)
- `9.4 Add New Product (Admin)` (`opr: ADD`)
- `9.5 Update Product (Admin)` (`opr: EDIT`)
- `9.6 Update Product Stock Quantity` (`opr: UPDATE_QTY`)
- `9.7 Restock Product (Increment Quantity)` (`opr: RESTOCK`)
- `9.8 Delete Product (Admin)` (`opr: DELETE`)

### 10. Data Gateway - Categories (`POST /api/data` - `category`)
- `10.1 List All Categories` (`opr: SELECT`)
- `10.2 Get Category by Slug or ID` (`opr: SELECT`, `condition: "silver-coins"`)
- `10.3 Add Category (Admin)` (`opr: ADD`)
- `10.4 Edit Category (Admin)` (`opr: EDIT`)
- `10.5 Delete Category (Admin)` (`opr: DELETE`)

### 11. Data Gateway - Shopping Cart (`POST /api/data` - `cart_item` & `cart`)
- `11.1 Fetch User Cart Items` (`opr: SELECT`, `user_id: {{userId}}`)
- `11.2 Fetch Guest Cart Items` (`opr: SELECT`, `guest_token: {{guestToken}}`)
- `11.3 Add Item to Cart` (`opr: ADD`)
- `11.4 Update Cart Item Quantity` (`opr: UPDATE_QTY`)
- `11.5 Remove Single Item from Cart` (`opr: DELETE`)
- `11.6 Clear Whole Cart` (`opr: DELETE`)
- `11.7 List Cart Headers (Admin)` (`proc_name: cart`, `opr: SELECT`)

### 12. Data Gateway - Wishlist (`POST /api/data` - `wishlist`)
- `12.1 Fetch User Wishlist` (`opr: SELECT`, `condition: {{userId}}`)
- `12.2 Add Product to Wishlist` (`opr: ADD`)
- `12.3 Remove Product from Wishlist` (`opr: DELETE`)

### 13. Data Gateway - Customer Addresses (`POST /api/data` - `address`)
- `13.1 List Saved Addresses for User` (`opr: SELECT`)
- `13.2 Add Delivery Address` (`opr: ADD`)
- `13.3 Update Delivery Address` (`opr: UPDATE`)
- `13.4 Delete Delivery Address` (`opr: DELETE`)

### 14. Data Gateway - Orders & Checkout (`POST /api/data` - `orders` & `order_item`)
- `14.1 Place Ready-Made Order (Customer Checkout)` (`opr: ADD`) — Enforces guest COD restrictions
- `14.2 List All Ready-Made Orders` (`opr: SELECT`)
- `14.3 Get Order by Order ID` (`opr: SELECT`, `condition: {{orderId}}`)
- `14.4 Get Order Line Items` (`proc_name: order_item`, `opr: SELECT`)
- `14.5 Update Order Status (Admin)` (`opr: EDIT`)
- `14.6 Delete Order (Admin)` (`opr: DELETE`)

### 15. Data Gateway - Users & OTP Logs (`POST /api/data` - `user` & `phone_otp`)
- `15.1 List All Users (Admin)` (`opr: SELECT`)
- `15.2 Get User by ID or Phone` (`opr: SELECT`)
- `15.3 Update User / Assign Admin Role (Admin)` (`opr: EDIT`)
- `15.4 Delete User (Admin)` (`opr: DELETE`)
- `15.5 Inspect Phone OTP Verification Logs (Admin)` (`proc_name: phone_otp`, `opr: SELECT`)

### 16. Data Gateway - Master Data & Images (`POST /api/data`)
- `16.1 List Making Methods (make_master)` (`opr: SELECT`)
- `16.2 Add Making Method (make_master)` (`opr: ADD`)
- `16.3 List All Images in Library (image)` (`opr: SELECT`)
- `16.4 Add Image Record to Library (image)` (`opr: ADD`)
- `16.5 List Product-Image Mappings (product_image)` (`opr: SELECT`)
- `16.6 Link Image to Product (product_image)` (`opr: ADD`)

---

## 🔑 Key Test Values & Quick-Start Credentials

- **Permanent Test Phone**: `9999999999`
- **Permanent Static OTP**: `123456` (10-day validity, bypasses WhatsApp API limits)
- **Admin Default Username**: `admin` (or phone `9999999999`)
- **Admin Default Password**: `admin123`
- **Default Local Port**: `5001` (matches `Backend/.env.localhost` and `Backend/.env`)
