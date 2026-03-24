
# Restaurant Management System

## 1. Landing Page
- Hero section with restaurant branding, tagline, and food imagery
- Restaurant overview section
- Featured menu items grid (fetched from Supabase)
- Category preview cards
- "View Menu" CTA → navigates to full menu page
- Smooth animations, responsive layout

## 2. Menu Page
- Fetch menu items from Supabase `menu` table
- Display cards with image, name, price, category
- Category filter tabs
- Search bar
- Responsive grid layout

## 3. Admin Login
- Hardcoded credentials (admin / admin123)
- Simple login form with frontend validation
- Redirects to admin dashboard

## 4. Admin Dashboard
- **Sales Metrics**: Total revenue, today's sales
- **Charts** (Recharts): Last 7 days bar chart, monthly trends line chart
- **Recent Sales Table**: Date, time, items, total, payment method

## 5. Menu Management (Admin)
- CRUD for menu items (name, price, category, image upload)
- Images stored in Supabase Storage bucket
- Image URLs stored in `menu` table

## 6. POS Billing System
- Browse menu items, add to cart
- Cart: adjust quantities, remove items
- Subtotal, discount input, final total calculation
- Payment method selection (Cash / Online)
- Bill preview in receipt format
- Save sale to Supabase `sales` table
- Clear bill button

## 7. Export Features
- **Bill Export**: Download as PNG (html2canvas) and PDF (jsPDF)
- **Sales Reports**: Export daily/weekly/monthly data as Excel (.xlsx) using SheetJS

## 8. Database Setup (Supabase)
- `menu` table: id, name, price, category, image_url, created_at
- `sales` table: id, items (jsonb), total, discount, payment_method, created_at
- Storage bucket for menu images
- RLS policies for public read on menu, authenticated writes

## 9. Navigation
- Customer side: Landing → Menu
- Admin side: Login → Dashboard, Menu Management, POS (sidebar navigation)

## Tech: React + Vite + Tailwind + Supabase + Recharts + jsPDF + html2canvas + SheetJS
