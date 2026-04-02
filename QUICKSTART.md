# Quick Start Guide - Library Management System

Get the application running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- MongoDB running (local or MongoDB Atlas account)
- pnpm or npm

## Step-by-Step Setup

### 1. Install Dependencies

#### Backend
```bash
cd server
npm install
cd ..
```

#### Frontend
```bash
pnpm install
```

### 2. Configure Environment

Create/update `.env.local` in project root:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Backend (for development with local MongoDB)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library-management
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library-management
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas** - no local setup needed

### 4. Start Backend Server

Open terminal in project root:
```bash
cd server
npm run dev
```

Expected output:
```
✓ MongoDB Connected
✓ Server running on port 5000
```

### 5. Start Frontend (New Terminal)

In project root:
```bash
pnpm dev
```

Expected output:
```
- ready started server on 0.0.0.0:3000
- event compiled client and server successfully
```

### 6. Access the Application

Open browser: **http://localhost:3000**

You should see the home page with admin panel options.

---

## 5-Pathway Main Menu Testing (User Portal)

The library management system now features a complete user portal with 5 distinct pathways:

### Step 1: Register & Login
1. Open browser: **http://localhost:3000**
2. Click "Register" tab
3. Enter credentials:
   - Name: "John Doe"
   - Email: "john@test.com"
   - Password: "password123"
4. Click "Create Account"
5. ✓ User logged in, Main Menu displayed with all controls available

### Step 2: Search Books (Pathway 1)
1. Click "Search Books" button
2. Enter search term (title/author/ISBN)
3. Click "Search"
4. ✓ Books display with details (title, author, ISBN, available copies)

### Step 3: Borrow Book (Pathway 2)
**System Pass Checks Applied:**
- Maximum 3 books per user
- No outstanding fines allowed
- Book must be available

1. Click "Borrow Book" button
2. Select book from dropdown
3. Click "Borrow Book"
4. ✓ Success: Book borrowed, due date set to 14 days from now

### Step 4: Return Book (Pathway 3)
**Fine Calculation:** ₹10 per day overdue

1. Click "Return & Fine" button
2. Select borrowed book from dropdown
3. Click "Return Book"
4. ✓ On-time return: No fine applied
5. ✓ Late return: Fine calculated and added to account

### Step 5: Pay Fine (Pathway 4)
**Three Payment Methods Available:**
- Cash Payment
- Debit/Credit Card
- Online Payment (UPI/Net Banking)

**Receipt Generated:** Includes receipt number, date/time, payment method, amount

1. Click "Fine Payment" button
2. Enter amount (must be ≥ outstanding fine)
3. Select payment method:
   - [ ] Cash Payment
   - [ ] Debit/Credit Card
   - [ ] Online Payment (UPI/Net Banking)
4. Click "Process Payment"
5. ✓ Receipt displays with all transaction details
6. ✓ Fine badge updates to ₹0 (green)
7. ✓ Click "Back to Main Menu" to continue

### Step 6: Logout (Pathway 5)
**Logout Protection:** Cannot logout with outstanding fines

1. Click "Logout" button
2. Confirmation screen shown
3. ✓ If fine = 0: Logout succeeds, redirected to login
4. ✓ If fine > 0: Button disabled, must clear fine first

---

## Comprehensive Workflow Test

**Duration:** ~10 minutes

1. **Register new user** with name, email, password
2. **Search** for available books
3. **Borrow** a book (system-pass checks a must-pass)
4. **Return on-time** (verify ₹0 fine)
5. **Borrow again** and **return late** (create ₹30+ fine)
6. **Pay fine** with different payment methods
   - Try Cash Payment → Receipt displays
   - Try Card Payment → Receipt displays  
   - Try Online Payment → Receipt displays
7. **Logout** after all fines cleared
8. **Login again** → Verify session persisted
9. **Repeat** with different users

---

## 2-Minute Test (Admin Panel)

Follow these steps to test the complete admin workflow:

### 1. Create a Member
1. Navigate to `/admin/members`
2. Click "Add New Member"
3. Fill in details:
   - Member ID: `MEM001`
   - Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `9876543210`
4. Click "Create Member"
5. ✓ Member created successfully

### 2. Create a Book
1. Navigate to `/admin/books`
2. Click "Add New Book"
3. Fill in details:
   - Book ID: `BOOK001`
   - Title: `Clean Code`
   - Author: `Robert C. Martin`
   - ISBN: `0132350882`
   - Total Copies: `3`
4. Click "Add Book"
5. ✓ Book added successfully

### 3. Issue Book (Tests Algorithm)
1. Navigate to `/admin/issue-book`
2. Select Member: `John Doe (MEM001) - Active`
3. Select Book: `Clean Code - Robert C. Martin (3 available)`
4. Click "Issue Book"
5. ✓ Should see success message with:
   - Transaction ID
   - Due Date (today + 14 days)
   - Issue Date

### 4. Return Book
1. Navigate to `/admin/return-book`
2. Select the transaction you just created
3. Click "Return Book"
4. ✓ Should see success message with:
   - No fine (returned on time)
   - Transaction updated

### 5. View Dashboard
1. Navigate to `/admin/dashboard`
2. ✓ See statistics:
   - Total Members: 1
   - Active Borrows: 0 (after return)
   - Total Books: 1
   - And more...

---

## Verify Algorithm Working

### Test: Borrow Limit Exceeded

1. **Setup:** Member with limit=5
2. **Create 5 more books** (BOOK002-006)
3. **Issue all 5 books** to the same member
4. **Try to issue 6th book** → Should see error: "Borrow Limit Exceeded"
5. ✓ Algorithm step 7 working

### Test: Inactive Member

1. **Go to Members → Find your member → Deactivate**
2. **Try to issue book** to that member
3. Should see error: "Member Account Inactive"
4. ✓ Algorithm step 5 working

### Test: Book Unavailable

1. **Create book with 1 copy**
2. **Issue to member A** (1 copy available → 0 copies)
3. **Try to issue same book to member B** → "Book Not Available"
4. ✓ Algorithm step 11 working

---

## Troubleshooting

### ❌ Backend won't connect to MongoDB
```
✗ MongoDB Connection Error
```

**Solution:**
- Make sure MongoDB is running: `mongod`
- Check MONGODB_URI is correct in `.env.local`
- For MongoDB Atlas, verify IP is whitelisted

### ❌ Frontend shows "Failed to load members"
**Solution:**
- Verify backend is running on port 5000
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check browser console for specific error (F12 → Console)

### ❌ Port 3000 or 5000 already in use
**Solution:**
```bash
# Change backend port in .env.local
PORT=5001

# Or kill existing process:
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### ❌ Cannot see API responses
**Solution:**
- Open browser DevTools (F12)
- Go to Network tab
- Try issuing a book
- Check if API calls are successful (200 status)

---

## Project Structure Overview

```
Project Root
├── app/                          # Next.js pages
│   ├── page.tsx                 # Home page
│   └── admin/
│       ├── layout.tsx           # Admin sidebar
│       ├── dashboard/page.tsx
│       ├── members/page.tsx
│       ├── books/page.tsx
│       ├── issue-book/page.tsx
│       ├── return-book/page.tsx
│       └── transactions/page.tsx
│
├── components/                   # React components
│   ├── IssueBookForm.tsx
│   ├── ReturnBookForm.tsx
│   ├── MemberManagement.tsx
│   ├── BookManagement.tsx
│   └── AdminDashboard.tsx
│
├── services/                    # API client
│   └── api.ts
│
├── server/                      # Express backend
│   ├── server.js               # Main server
│   ├── models/                 # MongoDB schemas
│   │   ├── Member.js
│   │   ├── Book.js
│   │   └── Transaction.js
│   ├── controllers/            # Route handlers
│   │   ├── memberController.js
│   │   ├── bookController.js
│   │   └── transactionController.js
│   ├── services/               # Business logic
│   │   ├── bookIssuingService.js    # 16-step algorithm
│   │   └── bookReturningService.js
│   ├── routes/                 # API routes
│   │   ├── members.js
│   │   ├── books.js
│   │   └── transactions.js
│   └── package.json
│
├── .env.local                   # Environment variables
├── LIBRARY_SETUP.md            # Detailed setup guide
├── ALGORITHM.md                # Algorithm documentation
└── QUICKSTART.md               # This file
```

---

## Common Tasks

### Add More Test Data

```javascript
// Create multiple members
POST /api/members
{
  "memberId": "MEM002",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "8765432109",
  "status": "Active"
}

// Create multiple books
POST /api/books
{
  "bookId": "BOOK002",
  "title": "The Pragmatic Programmer",
  "author": "Hunt & Thomas",
  "isbn": "0201616416",
  "totalCopies": 2
}
```

### View Database Directly

**MongoDB Compass or MongoDB Atlas UI:**
- Collection: `members` - View all members
- Collection: `books` - View all books
- Collection: `transactions` - View all transactions

### Check Transaction Details

```bash
# Using MongoDB shell
mongosh
use library-management
db.transactions.findOne()
```

---

## Performance Tips

1. **Use MongoDB Indexes** - Already configured
2. **Pagination** - For large datasets (not yet implemented)
3. **Caching** - Consider Redis for availability (future)
4. **Lazy Loading** - Frontend already uses this

---

## Next Steps

After testing:

1. **Add authentication** - Protect admin routes
2. **Add email notifications** - Notify overdue books
3. **Add search/filtering** - Better book discovery
4. **Add reporting** - Export transaction data
5. **Deploy** - To production (Vercel + MongoDB Atlas)

---

## Helpful Commands

```bash
# Check if ports are available
lsof -i :3000      # Frontend
lsof -i :5000      # Backend

# Run backend with auto-reload
cd server && npm run dev

# Run frontend with next dev
pnpm dev

# Check MongoDB connection
mongosh "mongodb+srv://username:password@cluster.mongodb.net/library-management"

# View logs in real-time
# Terminal 1: Backend logs
# Terminal 2: Frontend logs
# Browser Console: API requests and errors
```

---

## Support

**Still stuck?**

1. Check browser console (F12)
2. Check backend terminal for errors
3. Verify MongoDB is running
4. Check `.env.local` configuration
5. Review LIBRARY_SETUP.md for detailed docs

---

## You're Done! 🎉

Your Library Management System is now running. Start adding members, books, and testing the 16-step issuing algorithm!
