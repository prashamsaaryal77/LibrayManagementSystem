# Library Management System - Complete Flow Documentation

## System Overview
The Library Management System is built with:
- **Frontend**: Next.js 16 with React
- **Backend**: Express.js with MongoDB
- **Authentication**: JWT-based token system with password hashing

## User Journey

### Phase 1: Authentication
Users must first authenticate before accessing the Main Menu.

#### Option A: New User Registration
1. User clicks "Register" on the initial login screen
2. Enters personal details:
   - Name (required)
   - Email (required, validated)
   - Password (minimum 6 characters)
3. System validates input and stores in User database
4. On success: User is logged in and directed to Main Menu
5. On failure: Error message displayed, user can retry

#### Option B: Existing User Login
1. User clicks "Login" on the initial login screen
2. Enters credentials:
   - Email
   - Password
3. System verifies against User database
4. On success: User is authenticated and directed to Main Menu
5. On failure: Display "Invalid email or password" error

### Phase 2: Main Menu - Five Pathways

After successful authentication, users access the Main Menu with **5 distinct pathways**:

#### **Pathway 1: Search Books** 🔍
- **Purpose**: Find books in the library
- **Flow**:
  1. User enters search term (title, author, ISBN)
  2. System queries database for matching books
  3. Results displayed with:
     - Book title
     - Author name
     - ISBN
     - Number of available copies
     - Status (Available/Unavailable)
  4. If no books found: "No books found" message
  5. User can perform another search or switch pathways

#### **Pathway 2: Borrow Book** 📚
- **Purpose**: Borrow a book from the library
- **System Pass Checks** (must pass all to borrow):
  1. Book must be available (availableCopies > 0)
  2. User hasn't hit borrow limit (max 3 active books)
  3. User has no outstanding fines (fines = ₹0)
- **Flow**:
  1. User selects book from available options dropdown
  2. System performs system-pass verification
  3. If checks pass:
     - Record transaction in database
     - Calculate due date (14 days from today + book.maxBorrowDays)
     - Update book's availableCopies count
     - Update user's borrowedBooks list
     - Display success message
  4. If checks fail:
     - Display specific failure reason
     - User can resolve issue or switch pathways
  5. After completion: User remains on borrow screen or switches pathways

#### **Pathway 3: Return & Fine** ↩️
- **Purpose**: Return borrowed books and manage fines
- **Fine Calculation**:
  - Fine per day: ₹10
  - Fine applied only if returned after due date
- **Flow**:
  1. User selects book from "Active borrowed books" dropdown
  2. User clicks "Return Book"
  3. System performs return operation:
     - Get transaction details
     - Calculate days overdue (if any)
     - Calculate fine amount (overdue days × ₹10)
     - Update transaction status to "Returned"
     - Increment book's availableCopies count
     - Update user's borrowedBooks list
  4. Display result:
     - If returned on time: "Book returned successfully" ✓
     - If overdue: "Book returned. Fine of ₹X applied for Y days overdue"
  5. Fine is added to user's outstanding fines
  6. User can return more books or switch pathways

#### **Pathway 4: Fine Payment** 💳
- **Purpose**: Pay outstanding fines
- **Two Payment Methods Available**:
  1. **Cash Payment** - In-person payment at library counter
  2. **eSewa Payment** - Digital wallet payment
- **Flow**:
  1. System displays: "Outstanding fine: ₹X"
  2. User selects payment method (Cash/eSewa)
  3. User enters payment amount
  4. User clicks "Process Payment"
  5. System completes payment:
     - Validates payment amount ≥ outstanding fine
     - Updates user's fines to 0 (or remaining amount)
     - Marks transactions as finePaid = true
  6. **Receipt Generation & Display**:
     ```
     PAYMENT SUCCESSFUL
     Payment Receipt
     ─────────────────
     Receipt No: RCP-[timestamp]
     Date & Time: [Full DateTime]
     User Name: [Name]
     Email: [Email]
     Payment Method: [Selected Method]
     Amount Paid: ₹[Amount]
     ─────────────────
     Thank you for your payment!
     ```
  7. User can view receipt, then return to Main Menu

#### **Pathway 5: Logout** 🚪
- **Purpose**: Exit the session securely
- **Pre-Logout Check**:
  1. System checks for outstanding fines
  2. If fines > 0: Display warning and block logout
     - Message: "Logout is blocked until all outstanding fines are cleared"
     - User must clear fines via Pathway 4
  3. If fines = 0: Allow logout
- **Flow**:
  1. User clicks "Logout" module
  2. Confirmation screen displayed:
     - "Are you sure you want to logout?"
     - "You will need to login again to access your library account"
     - If fines pending: Additional warning
  3. User clicks "Confirm Logout":
     - Session cleared
     - Local storage cleared
     - Redirect to initial authentication screen
  4. User clicks "Cancel":
     - Return to previous screen
     - No logout performed

### Phase 3: Auto-Navigation
After completing any of the first 4 pathways (Search, Borrow, Return, Payment):
- System automatically redirects user back to **Main Menu**
- User can:
  - Perform another action
  - Switch to different pathway
  - Proceed to Logout

## Data Flow Summary

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  passwordHash: String,
  role: 'Admin' | 'Member',
  borrowedBooks: [{
    bookId: String,
    title: String,
    borrowedAt: Date,
    dueDate: Date
  }],
  fines: Number (₹),
  createdAt: Date,
  updatedAt: Date
}
```

### Book Model
```javascript
{
  _id: ObjectId,
  bookId: String (unique, BK00001 format),
  title: String,
  author: String,
  isbn: String (unique),
  status: 'Available' | 'Borrowed',
  totalCopies: Number,
  availableCopies: Number,
  maxBorrowDays: Number (default: 14),
  createdAt: Date
}
```

### Transaction Model
```javascript
{
  _id: ObjectId,
  transactionId: String (unique),
  userId: ObjectId (ref: User),
  bookId: String,
  borrowDate: Date,
  issueDate: Date,
  dueDate: Date,
  returnDate: Date | null,
  status: 'Issued' | 'Returned' | 'Overdue',
  fineAmount: Number,
  finePaid: Boolean,
  fineClearedAt: Date | null,
  createdAt: Date
}
```

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - Authenticate user

### Book Routes (`/api/books`)
- `GET /` - Get all books
- `GET /search?query=title` - Search books

### Transaction Routes (`/api/transactions`)
- `POST /borrow` - Borrow a book
- `PUT /return/:transactionId` - Return a book
- `POST /pay-fine` - Process fine payment
- `GET /user/:userId` - Get user's transactions

## Error Handling

### Common Errors During Borrow
- "User not found" - Invalid user session
- "Book not found" - Book doesn't exist
- "System Pass Failed: a user can borrow fewer than 4 books" - Already have 3 books
- "System Pass Failed: clear unpaid fines before borrowing" - Outstanding fines
- "Book is currently unavailable" - No copies available

### Common Errors During Return
- "Transaction not found" - Invalid transaction ID
- "This book has already been returned" - Book was returned before

### Common Errors During Payment
- "No unpaid fines found" - Nothing to pay
- "Payment amount must be at least ₹X" - Insufficient amount

## Security Features

1. **Password Security**:
   - PBKDF2 hashing with salt
   - 1000 iterations
   - SHA-512 algorithm

2. **Authentication**:
   - JWT-based tokens
   - Base64URL encoding
   - HMAC-SHA256 signature

3. **Session Management**:
   - Tokens stored in browser localStorage
   - Automatic logout on session clear
   - Fine verification before logout

## Development Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017
- pnpm (or npm)

### Installation
```bash
# Install dependencies
npm install

# Root directory (frontend)
npm install

# Server directory
cd server && npm install

# Start development
npm run dev
```

### Environment Variables
Create `.env.local` in root directory:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Create `.env` in server directory:
```
MONGODB_URI=mongodb://localhost:27017/library-management
PORT=5000
AUTH_SECRET=library-management-secret
```

## Key Constants

- **Max Borrow Limit**: 3 books per user
- **Fine Per Day**: ₹10
- **Default Borrow Period**: 14 days
- **Password Min Length**: 6 characters
