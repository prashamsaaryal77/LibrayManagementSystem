# API Examples - Library Management System

Complete examples for all API endpoints with cURL, JavaScript, and responses.

---

## Base URL

```
http://localhost:5000/api
```

---

## Members Endpoints

### 1. Create Member

```bash
curl -X POST http://localhost:5000/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "MEM001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "status": "Active",
    "maxBorrowLimit": 5
  }'
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/members', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    memberId: 'MEM001',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210'
  })
});
const data = await response.json();
```

**Success Response (201):**
```json
{
  "message": "Member created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "memberId": "MEM001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "status": "Active",
    "maxBorrowLimit": 5,
    "createdAt": "2024-02-23T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Member ID already exists"
}
```

---

### 2. Get All Members

```bash
curl http://localhost:5000/api/members
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/members');
const data = await response.json();
console.log(data);  // { count: 3, data: [...] }
```

**Response (200):**
```json
{
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "memberId": "MEM001",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "status": "Active",
      "maxBorrowLimit": 5,
      "createdAt": "2024-02-23T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "memberId": "MEM002",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "8765432109",
      "status": "Active",
      "maxBorrowLimit": 5,
      "createdAt": "2024-02-23T10:31:00.000Z"
    }
  ]
}
```

---

### 3. Get Member by ID

```bash
curl http://localhost:5000/api/members/MEM001
```

**JavaScript:**
```javascript
const memberId = 'MEM001';
const response = await fetch(`http://localhost:5000/api/members/${memberId}`);
const data = await response.json();
```

**Response (200):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "memberId": "MEM001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "status": "Active",
    "maxBorrowLimit": 5,
    "createdAt": "2024-02-23T10:30:00.000Z"
  }
}
```

---

### 4. Update Member

```bash
curl -X PUT http://localhost:5000/api/members/MEM001 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "phone": "9999999999"
  }'
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/members/MEM001', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Smith',
    phone: '9999999999'
  })
});
```

**Response (200):**
```json
{
  "message": "Member updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "memberId": "MEM001",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "9999999999",
    "status": "Active",
    "maxBorrowLimit": 5,
    "createdAt": "2024-02-23T10:30:00.000Z"
  }
}
```

---

### 5. Update Member Status

```bash
curl -X PUT http://localhost:5000/api/members/MEM001/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Inactive"}'
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/members/MEM001/status', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'Inactive' })
});
```

**Response (200):**
```json
{
  "message": "Member status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "memberId": "MEM001",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "9999999999",
    "status": "Inactive",
    "maxBorrowLimit": 5,
    "createdAt": "2024-02-23T10:30:00.000Z"
  }
}
```

---

## Books Endpoints

### 1. Create Book

```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "BOOK001",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "0132350882",
    "totalCopies": 3,
    "maxBorrowDays": 14
  }'
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/books', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bookId: 'BOOK001',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '0132350882',
    totalCopies: 3,
    maxBorrowDays: 14
  })
});
```

**Response (201):**
```json
{
  "message": "Book created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "bookId": "BOOK001",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "0132350882",
    "totalCopies": 3,
    "availableCopies": 3,
    "maxBorrowDays": 14,
    "createdAt": "2024-02-23T10:35:00.000Z"
  }
}
```

---

### 2. Get All Books

```bash
curl http://localhost:5000/api/books
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/books');
const data = await response.json();
```

**Response (200):**
```json
{
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "bookId": "BOOK001",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "0132350882",
      "totalCopies": 3,
      "availableCopies": 2,
      "maxBorrowDays": 14,
      "createdAt": "2024-02-23T10:35:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "bookId": "BOOK002",
      "title": "The Pragmatic Programmer",
      "author": "Hunt & Thomas",
      "isbn": "0201616416",
      "totalCopies": 2,
      "availableCopies": 2,
      "maxBorrowDays": 14,
      "createdAt": "2024-02-23T10:36:00.000Z"
    }
  ]
}
```

---

### 3. Get Book by ID

```bash
curl http://localhost:5000/api/books/BOOK001
```

**Response (200):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "bookId": "BOOK001",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "0132350882",
    "totalCopies": 3,
    "availableCopies": 2,
    "maxBorrowDays": 14,
    "createdAt": "2024-02-23T10:35:00.000Z"
  }
}
```

---

### 4. Update Book

```bash
curl -X PUT http://localhost:5000/api/books/BOOK001 \
  -H "Content-Type: application/json" \
  -d '{
    "totalCopies": 5,
    "maxBorrowDays": 21
  }'
```

**Response (200):**
```json
{
  "message": "Book updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "bookId": "BOOK001",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "0132350882",
    "totalCopies": 5,
    "availableCopies": 4,
    "maxBorrowDays": 21,
    "createdAt": "2024-02-23T10:35:00.000Z"
  }
}
```

---

## Transactions Endpoints

### 1. Issue Book (⭐ Core Algorithm)

```bash
curl -X POST http://localhost:5000/api/transactions/issue \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "MEM001",
    "bookId": "BOOK001",
    "issueDate": "2024-02-23T00:00:00Z"
  }'
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/transactions/issue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    memberId: 'MEM001',
    bookId: 'BOOK001',
    issueDate: new Date().toISOString()
  })
});
const data = await response.json();
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Book Issued Successfully",
  "code": "ISSUE_SUCCESS",
  "data": {
    "transactionId": "TXN-1708674600000-ABC1D2E3F",
    "memberName": "John Doe",
    "bookTitle": "Clean Code",
    "issueDate": "2024-02-23T00:00:00.000Z",
    "dueDate": "2024-03-08T00:00:00.000Z",
    "maxBorrowDays": 14
  }
}
```

**Error Response (400) - Member Limit Exceeded:**
```json
{
  "error": "Borrow Limit Exceeded",
  "code": "BORROW_LIMIT_EXCEEDED"
}
```

**Error Response (400) - Book Not Available:**
```json
{
  "error": "Book Not Available",
  "code": "BOOK_NOT_AVAILABLE"
}
```

**Error Response (400) - Member Inactive:**
```json
{
  "error": "Member Account Inactive",
  "code": "MEMBER_INACTIVE"
}
```

---

### 2. Return Book

```bash
curl -X POST http://localhost:5000/api/transactions/return \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN-1708674600000-ABC1D2E3F",
    "returnDate": "2024-02-28T00:00:00Z"
  }'
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/transactions/return', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transactionId: 'TXN-1708674600000-ABC1D2E3F',
    returnDate: new Date().toISOString()
  })
});
```

**Success Response - On Time (200):**
```json
{
  "success": true,
  "message": "Book Returned Successfully",
  "code": "RETURN_SUCCESS",
  "data": {
    "transactionId": "TXN-1708674600000-ABC1D2E3F",
    "bookTitle": "Clean Code",
    "issueDate": "2024-02-23T00:00:00.000Z",
    "dueDate": "2024-03-08T00:00:00.000Z",
    "returnDate": "2024-02-28T00:00:00.000Z",
    "fineAmount": 0,
    "message": "Returned on time"
  }
}
```

**Success Response - Overdue (200):**
```json
{
  "success": true,
  "message": "Book Returned Successfully",
  "code": "RETURN_SUCCESS",
  "data": {
    "transactionId": "TXN-1708674600000-ABC1D2E3F",
    "bookTitle": "Clean Code",
    "issueDate": "2024-02-23T00:00:00.000Z",
    "dueDate": "2024-03-08T00:00:00.000Z",
    "returnDate": "2024-03-15T00:00:00.000Z",
    "fineAmount": 70,
    "message": "Fine of 70 charged for 7 overdue days"
  }
}
```

---

### 3. Get All Transactions

```bash
curl http://localhost:5000/api/transactions
```

**Response (200):**
```json
{
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "transactionId": "TXN-1708674600000-ABC1D2E3F",
      "memberId": "MEM001",
      "bookId": "BOOK001",
      "issueDate": "2024-02-23T00:00:00.000Z",
      "dueDate": "2024-03-08T00:00:00.000Z",
      "returnDate": "2024-02-28T00:00:00.000Z",
      "status": "Returned",
      "fineAmount": 0,
      "createdAt": "2024-02-23T10:40:00.000Z"
    }
  ]
}
```

---

### 4. Get Member Transactions

```bash
curl http://localhost:5000/api/transactions/member/MEM001
```

**Response (200):**
```json
{
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "transactionId": "TXN-1708674600000-ABC1D2E3F",
      "memberId": "MEM001",
      "bookId": "BOOK001",
      "issueDate": "2024-02-23T00:00:00.000Z",
      "dueDate": "2024-03-08T00:00:00.000Z",
      "returnDate": "2024-02-28T00:00:00.000Z",
      "status": "Returned",
      "fineAmount": 0,
      "createdAt": "2024-02-23T10:40:00.000Z"
    }
  ]
}
```

---

### 5. Get Overdue Books

```bash
curl http://localhost:5000/api/transactions/overdue
```

**Response (200):**
```json
{
  "count": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439031",
      "transactionId": "TXN-1708674700000-XYZ9W8V7",
      "memberId": "MEM002",
      "bookId": "BOOK002",
      "issueDate": "2024-02-10T00:00:00.000Z",
      "dueDate": "2024-02-24T00:00:00.000Z",
      "returnDate": null,
      "status": "Overdue",
      "fineAmount": 0,
      "createdAt": "2024-02-10T10:30:00.000Z"
    }
  ]
}
```

---

### 6. Get Transaction by ID

```bash
curl http://localhost:5000/api/transactions/TXN-1708674600000-ABC1D2E3F
```

**Response (200):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "transactionId": "TXN-1708674600000-ABC1D2E3F",
    "memberId": "MEM001",
    "bookId": "BOOK001",
    "issueDate": "2024-02-23T00:00:00.000Z",
    "dueDate": "2024-03-08T00:00:00.000Z",
    "returnDate": "2024-02-28T00:00:00.000Z",
    "status": "Returned",
    "fineAmount": 0,
    "createdAt": "2024-02-23T10:40:00.000Z"
  }
}
```

---

## Error Codes Reference

| Code | HTTP Status | Message | Meaning |
|------|-----------|---------|---------|
| INVALID_MEMBER_ID | 400 | Invalid Member ID | Member not found |
| MEMBER_INACTIVE | 400 | Member Account Inactive | Member status is not Active |
| BORROW_LIMIT_EXCEEDED | 400 | Borrow Limit Exceeded | Member at max borrow limit |
| INVALID_BOOK_ID | 400 | Invalid Book ID | Book not found |
| BOOK_NOT_AVAILABLE | 400 | Book Not Available | No copies available |
| INVALID_TRANSACTION_ID | 400 | Invalid Transaction ID | Transaction not found |
| ALREADY_RETURNED | 400 | Book Already Returned | Transaction already returned |
| SYSTEM_ERROR | 500 | Error processing request | Server error |

---

## Testing with Postman

### Import Collection
Create new collection with following requests:

**1. Create Member**
- Method: POST
- URL: `{{base_url}}/members`
- Body: JSON with member data

**2. Create Book**
- Method: POST
- URL: `{{base_url}}/books`
- Body: JSON with book data

**3. Issue Book**
- Method: POST
- URL: `{{base_url}}/transactions/issue`
- Body: 
```json
{
  "memberId": "MEM001",
  "bookId": "BOOK001"
}
```

---

## Testing with JavaScript

```javascript
// API Client
const API_URL = 'http://localhost:5000/api';

async function issueBook(memberId, bookId) {
  const response = await fetch(`${API_URL}/transactions/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memberId,
      bookId,
      issueDate: new Date().toISOString()
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Error:', error.error, error.code);
    return null;
  }
  
  return await response.json();
}

// Usage
const result = await issueBook('MEM001', 'BOOK001');
if (result?.success) {
  console.log('Transaction ID:', result.data.transactionId);
  console.log('Due Date:', result.data.dueDate);
}
```

---

## Notes

- All dates use ISO 8601 format
- Fine is ₹10 per day (configurable)
- Fine calculated only on return after due date
- Member limit is per active/issued transactions (includes overdue)
- Book availability updated immediately on issue/return

---

**For more information, see ALGORITHM.md for detailed algorithm flow.**
