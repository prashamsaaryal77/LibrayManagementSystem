# 16-Step Library Book Issuing Algorithm

## Implementation Overview

This document details the 16-step book issuing algorithm implemented in the Library Management System.

## Algorithm Steps

### Step 1-2: Start & Check Member Existence
**File:** `/server/services/bookIssuingService.js`

```javascript
const member = await Member.findOne({ memberId });
if (!member) {
  return { success: false, message: 'Invalid Member ID', code: 'INVALID_MEMBER_ID' };
}
```

**Action:** Query MongoDB Members collection for the given memberId
**Error:** "Invalid Member ID" - Stop process

---

### Step 3-5: Check Member Status is Active
**File:** `/server/services/bookIssuingService.js`

```javascript
if (member.status !== 'Active') {
  return { success: false, message: 'Member Account Inactive', code: 'MEMBER_INACTIVE' };
}
```

**Action:** Verify member status field equals 'Active'
**Error:** "Member Account Inactive" - Stop process

---

### Step 6-7: Count Issued Books & Check Borrow Limit

**File:** `/server/services/bookIssuingService.js`

```javascript
const issuedBooksCount = await Transaction.countDocuments({
  memberId: member.memberId,
  status: { $in: ['Issued', 'Overdue'] }
});

if (issuedBooksCount >= member.maxBorrowLimit) {
  return { success: false, message: 'Borrow Limit Exceeded', code: 'BORROW_LIMIT_EXCEEDED' };
}
```

**Action:** 
- Count transactions for this member with status 'Issued' or 'Overdue'
- Compare count with member.maxBorrowLimit (default: 5)

**Error:** "Borrow Limit Exceeded" - Stop process

---

### Step 8-9: Check Book Existence
**File:** `/server/services/bookIssuingService.js`

```javascript
const book = await Book.findOne({ bookId });
if (!book) {
  return { success: false, message: 'Invalid Book ID', code: 'INVALID_BOOK_ID' };
}
```

**Action:** Query MongoDB Books collection for the given bookId
**Error:** "Invalid Book ID" - Stop process

---

### Step 10-11: Check Book Availability
**File:** `/server/services/bookIssuingService.js`

```javascript
if (book.availableCopies <= 0) {
  return { success: false, message: 'Book Not Available', code: 'BOOK_NOT_AVAILABLE' };
}
```

**Action:** Check if book.availableCopies > 0
**Error:** "Book Not Available" - Stop process

---

### Step 12: Calculate Due Date
**File:** `/server/services/bookIssuingService.js`

```javascript
const dueDate = new Date(issueDate);
dueDate.setDate(dueDate.getDate() + book.maxBorrowDays);
```

**Formula:** DueDate = IssueDate + maxBorrowDays

**Example:**
- Issue Date: 2024-02-23
- Max Borrow Days: 14
- Due Date: 2024-03-08

---

### Step 13: Create Transaction Record
**File:** `/server/services/bookIssuingService.js`

```javascript
const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
const transaction = new Transaction({
  transactionId,
  memberId: member.memberId,
  bookId: book.bookId,
  issueDate,
  dueDate,
  status: 'Issued',
  fineAmount: 0
});

await transaction.save();
```

**Action:** 
- Generate unique transactionId
- Create new Transaction document
- Set status to 'Issued'
- Save to MongoDB

---

### Step 14: Decrease Available Book Copies
**File:** `/server/services/bookIssuingService.js`

```javascript
book.availableCopies -= 1;
await book.save();
```

**Action:** 
- Decrement availableCopies by 1
- Update book record in MongoDB

**Result:** 
- Book availability updated
- Other queries will see new availability count

---

### Step 15: Display Success Message
**File:** `/server/services/bookIssuingService.js`

```javascript
return {
  success: true,
  message: 'Book Issued Successfully',
  code: 'ISSUE_SUCCESS',
  data: {
    transactionId,
    memberName: member.name,
    bookTitle: book.title,
    issueDate,
    dueDate,
    maxBorrowDays: book.maxBorrowDays
  }
};
```

**Returns:**
- Success flag: true
- Transaction details
- Due date for member information

---

### Step 16: Stop
Process complete. System ready for next request.

---

## Error Flow Diagram

```
START
  ↓
Check Member Exists? → NO → "Invalid Member ID" → STOP
  ↓ YES
Check Member Active? → NO → "Member Account Inactive" → STOP
  ↓ YES
Count Issued Books → Borrow Limit? → YES → "Borrow Limit Exceeded" → STOP
  ↓ NO
Check Book Exists? → NO → "Invalid Book ID" → STOP
  ↓ YES
Check Availability? → NO → "Book Not Available" → STOP
  ↓ YES
Calculate Due Date
  ↓
Create Transaction
  ↓
Decrease Copies
  ↓
Return Success + Details → STOP
```

---

## API Implementation

### Endpoint
```
POST /api/transactions/issue
```

### Request Body
```json
{
  "memberId": "MEM001",
  "bookId": "BOOK001",
  "issueDate": "2024-02-23T00:00:00Z"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Book Issued Successfully",
  "code": "ISSUE_SUCCESS",
  "data": {
    "transactionId": "TXN-1708670400000-ABC1D2E3F",
    "memberName": "John Doe",
    "bookTitle": "Clean Code",
    "issueDate": "2024-02-23T00:00:00.000Z",
    "dueDate": "2024-03-08T00:00:00.000Z",
    "maxBorrowDays": 14
  }
}
```

### Error Response (400)
```json
{
  "error": "Borrow Limit Exceeded",
  "code": "BORROW_LIMIT_EXCEEDED"
}
```

---

## Database Queries

### Query 1: Find Member
```mongodb
db.members.findOne({ memberId: "MEM001" })
```

### Query 2: Count Issued Books
```mongodb
db.transactions.countDocuments({
  memberId: "MEM001",
  status: { $in: ["Issued", "Overdue"] }
})
```

### Query 3: Find Book
```mongodb
db.books.findOne({ bookId: "BOOK001" })
```

### Query 4: Create Transaction
```mongodb
db.transactions.insertOne({
  transactionId: "TXN-...",
  memberId: "MEM001",
  bookId: "BOOK001",
  issueDate: ISODate("2024-02-23"),
  dueDate: ISODate("2024-03-08"),
  status: "Issued",
  fineAmount: 0,
  createdAt: ISODate()
})
```

### Query 5: Update Book Availability
```mongodb
db.books.updateOne(
  { bookId: "BOOK001" },
  { $inc: { availableCopies: -1 } }
)
```

---

## Validation Rules

| Step | Field | Rule | Error Code |
|------|-------|------|-----------|
| 1-2 | memberId | Must exist in Members | INVALID_MEMBER_ID |
| 3-5 | member.status | Must equal "Active" | MEMBER_INACTIVE |
| 6-7 | issued count | Must be < maxBorrowLimit | BORROW_LIMIT_EXCEEDED |
| 8-9 | bookId | Must exist in Books | INVALID_BOOK_ID |
| 10-11 | availableCopies | Must be > 0 | BOOK_NOT_AVAILABLE |

---

## Time Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Find Member | O(1) | Indexed by memberId |
| Count Transactions | O(n) | Where n = member's transactions |
| Find Book | O(1) | Indexed by bookId |
| Create Transaction | O(1) | Write operation |
| Update Book | O(1) | Write operation |
| **Total** | **O(n)** | Dominated by count query |

---

## Edge Cases

### 1. Member with Exactly Borrow Limit
- Member has maxBorrowLimit = 5
- Member currently has 5 issued books
- Request to issue new book → "Borrow Limit Exceeded"

### 2. Book with 1 Copy
- Book has totalCopies = 1, availableCopies = 1
- First person issues it → availableCopies becomes 0
- Second person cannot issue → "Book Not Available"

### 3. Overdue Books Don't Count
- Member has 3 issued books + 2 overdue books
- Overdue books still count toward limit
- Status includes both 'Issued' and 'Overdue'

### 4. Same Member Multiple Books
- Member can borrow different books up to limit
- Can borrow multiple copies of same book (if available)

---

## Extensions

### Fine Calculation (On Return)
```javascript
if (returnDate > dueDate) {
  const overdueDays = Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24));
  fineAmount = overdueDays * FINE_PER_DAY; // ₹10 per day
}
```

### Renewal (Not Implemented)
Could extend dueDate without return/reissue

### Book Reservation (Not Implemented)
Queue members waiting for unavailable books

---

## Testing the Algorithm

### Test Case 1: Happy Path
```javascript
issueBook("MEM001", "BOOK001")
// Expected: Success with transaction ID and due date
```

### Test Case 2: Invalid Member
```javascript
issueBook("INVALID", "BOOK001")
// Expected: Error - "Invalid Member ID"
```

### Test Case 3: Member Exceeded Limit
```javascript
// Setup: Create member with limit=2, issue 2 books
issueBook("MEM001", "BOOK003")
// Expected: Error - "Borrow Limit Exceeded"
```

### Test Case 4: Book Unavailable
```javascript
// Setup: Create book with availableCopies=0
issueBook("MEM001", "BOOK004")
// Expected: Error - "Book Not Available"
```

---

## Monitoring & Logging

### Log Issued Books
```javascript
console.log(`[Issue] Transaction ${transactionId} created for ${member.name}`);
console.log(`[Stock] Book ${book.title} availability: ${book.availableCopies}`);
```

### Metrics
- Total books issued per day
- Popular books (frequently issued)
- Members exceeding borrow limit
- Overdue rate

---

## Smart Ranking & Search Algorithms

### 1. Time-Decay Popularity Algorithm (Smart Ranking)
**Implementation:** `/server/controllers/bookController.js`

Instead of simple popularity, the system uses a gravity-based time decay formula to surface "trending" books.

**Formula:**
$$Score = \frac{BorrowCount}{(AgeInDays + 2)^{G}}$$
- **BorrowCount**: Total number of times the book was borrowed.
- **AgeInDays**: Days since the book was added to the library.
- **G (Gravity)**: Constant set to `1.5` to control how fast the rank drops over time.

**Purpose**: Ensures that new books with rising popularity can outrank older books that have higher absolute borrow counts but are no longer trending.

---

### 2. Binary Search Optimization
**Implementation:** `/lib/algorithmUtils.ts`

For internal lookups in the client dashboard, the system utilizes **Binary Search** instead of linear search ($O(N)$).

**Logic**:
1. The book collection is sorted by `bookId`.
2. The search space is repeatedly halved until the target is found.

**Time Complexity**: $O(\log N)$
**Best Use Case**: Finding specific book details in a large collection for borrow/return operations.

---

## References

- File: `/server/services/bookIssuingService.js`
- Endpoint: `POST /api/transactions/issue`
- Frontend: `/components/IssueBookForm.tsx`
