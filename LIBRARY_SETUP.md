# Library Management System - MERN Stack

A complete library management system implementing the 16-step book issuing algorithm with member management, book catalog, and transaction tracking.

## Architecture

```
Frontend (Next.js + React)
    ↓
API Service Layer (Axios)
    ↓
Backend API (Express.js)
    ↓
Database (MongoDB)
```

## Features Implemented

### Core Algorithm (16-step Book Issuing Process)
1. ✓ Check MemberID exists
2. ✓ Check member status is Active
3. ✓ Count issued books for member
4. ✓ Check against borrow limit
5. ✓ Check BookID exists
6. ✓ Check book availability
7. ✓ Calculate due date
8. ✓ Create transaction record
9. ✓ Update book availability
10. ✓ Return success message

### Features
- **Member Management**: Add, view, deactivate members
- **Book Catalog**: Add and manage books with availability tracking
- **Issue Book**: Issue books with algorithm validation
- **Return Book**: Process returns and calculate fines for overdue books
- **Admin Dashboard**: System statistics and recent transactions
- **Transaction History**: View all transactions with filters

## Project Structure

### Frontend (`/app`, `/components`, `/services`)
```
app/
  ├── page.tsx                 # Home page with navigation
  └── admin/
      ├── layout.tsx           # Admin sidebar layout
      ├── dashboard/
      ├── members/
      ├── books/
      ├── issue-book/
      ├── return-book/
      └── transactions/

components/
  ├── IssueBookForm.tsx        # Book issuing form
  ├── ReturnBookForm.tsx       # Book return form
  ├── MemberManagement.tsx     # Member CRUD
  ├── BookManagement.tsx       # Book CRUD
  └── AdminDashboard.tsx       # Dashboard

services/
  └── api.ts                   # Axios API client
```

### Backend (`/server`)
```
server/
  ├── server.js                # Main server file
  ├── models/
  │   ├── Member.js            # Member schema
  │   ├── Book.js              # Book schema
  │   └── Transaction.js       # Transaction schema
  ├── controllers/
  │   ├── memberController.js
  │   ├── bookController.js
  │   └── transactionController.js
  ├── services/
  │   ├── bookIssuingService.js    # 16-step algorithm
  │   └── bookReturningService.js
  ├── routes/
  │   ├── members.js
  │   ├── books.js
  │   └── transactions.js
  └── package.json
```

## Database Schema

### Members Collection
```javascript
{
  memberId: String (unique),
  name: String,
  email: String,
  phone: String,
  status: 'Active' | 'Inactive',
  maxBorrowLimit: Number (default: 5),
  createdAt: Date
}
```

### Books Collection
```javascript
{
  bookId: String (unique),
  title: String,
  author: String,
  isbn: String,
  totalCopies: Number,
  availableCopies: Number,
  maxBorrowDays: Number (default: 14),
  createdAt: Date
}
```

### Transactions Collection
```javascript
{
  transactionId: String (unique),
  memberId: String (ref),
  bookId: String (ref),
  issueDate: Date,
  dueDate: Date,
  returnDate: Date | null,
  status: 'Issued' | 'Returned' | 'Overdue',
  fineAmount: Number,
  createdAt: Date
}
```

## API Endpoints

### Members
```
POST   /api/members              # Create member
GET    /api/members              # Get all members
GET    /api/members/:memberId    # Get member
PUT    /api/members/:memberId    # Update member
PUT    /api/members/:memberId/status  # Change status
```

### Books
```
POST   /api/books                # Add book
GET    /api/books                # Get all books
GET    /api/books/:bookId        # Get book
PUT    /api/books/:bookId        # Update book
```

### Transactions
```
POST   /api/transactions/issue   # Issue book (16-step algorithm)
POST   /api/transactions/return  # Return book
GET    /api/transactions         # Get all transactions
GET    /api/transactions/member/:memberId  # Member history
GET    /api/transactions/overdue # Get overdue books
GET    /api/transactions/:transactionId    # Get transaction
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)
- pnpm or npm

### Backend Setup

1. **Install backend dependencies**
```bash
cd server
npm install
```

2. **Configure environment**
```bash
# Create .env or update existing .env.local
# Set MONGODB_URI and PORT
```

3. **Start backend server**
```bash
npm run dev
# Server will run on http://localhost:5000
```

### Frontend Setup

1. **Install frontend dependencies**
```bash
# In project root
pnpm install
```

2. **Configure API endpoint**
```bash
# Update .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. **Start frontend**
```bash
pnpm dev
# Frontend will run on http://localhost:3000
```

## Usage

### 1. Add Members
- Go to `/admin/members`
- Click "Add New Member"
- Fill in details and create

### 2. Add Books
- Go to `/admin/books`
- Click "Add New Book"
- Enter book information

### 3. Issue Book
- Go to `/admin/issue-book`
- Select member and book
- System validates all conditions
- Get transaction ID and due date

### 4. Return Book
- Go to `/admin/return-book`
- Select issued transaction
- System calculates fines if overdue
- Transaction updated

### 5. View Dashboard
- Go to `/admin/dashboard`
- See system statistics
- Check for overdue books

## 16-Step Algorithm Implementation

Located in: `/server/services/bookIssuingService.js`

```javascript
const result = await issueBook(memberId, bookId, issueDate);
```

**Algorithm Flow:**
1. ✓ Validate member exists
2. ✓ Validate member is Active
3. ✓ Count current issued books
4. ✓ Check < borrow limit
5. ✓ Validate book exists
6. ✓ Check availability > 0
7. ✓ Calculate due date
8. ✓ Create transaction
9. ✓ Decrease available copies
10. ✓ Return success message

**Error Codes:**
- `INVALID_MEMBER_ID` - Member not found
- `MEMBER_INACTIVE` - Member account inactive
- `BORROW_LIMIT_EXCEEDED` - Too many issued books
- `INVALID_BOOK_ID` - Book not found
- `BOOK_NOT_AVAILABLE` - No copies available
- `SYSTEM_ERROR` - Server error

## Testing the System

### Quick Test Flow
1. Create a member (MEM001)
2. Create a book (BOOK001)
3. Issue book to member
4. View transaction in history
5. Return the book
6. Check dashboard for statistics

### Test Data
```javascript
// Member
{ 
  memberId: "MEM001", 
  name: "John Doe", 
  email: "john@example.com",
  phone: "9876543210",
  status: "Active"
}

// Book
{ 
  bookId: "BOOK001", 
  title: "Clean Code",
  author: "Robert C. Martin",
  isbn: "0132350882",
  totalCopies: 3,
  maxBorrowDays: 14
}
```

## Fine Calculation

- Fine per day: ₹10 (configurable in `/server/services/bookReturningService.js`)
- Calculated when book returned after due date
- Automatically added to transaction record

## Error Handling

All API endpoints return structured error responses:
```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": "Additional details if available"
}
```

## Performance Considerations

- Transaction IDs use timestamps + random strings for uniqueness
- Indexes on frequently queried fields (memberId, bookId)
- Pagination recommended for large datasets
- Consider adding caching for book availability

## Future Enhancements

- Authentication and authorization
- Email notifications for overdue books
- Book reservation system
- Member fine management
- Reporting and analytics
- Book search and filtering
- Bulk operations
- API documentation (Swagger)

## Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env.local
- Verify connection string format

**CORS Error**
- Backend CORS is configured for localhost:3000
- Update if running on different port
- Check backend server.js for CORS config

**API Not Responding**
- Verify backend is running on port 5000
- Check NEXT_PUBLIC_API_URL in .env.local
- Look for errors in terminal/console logs

## Support

For issues or questions, review the code comments and error messages. The system includes comprehensive error handling and logging.
