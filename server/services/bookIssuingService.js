const Member = require('../models/Member');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

// Implements the 16-step library algorithm for book issuing
const issueBook = async (memberId, bookId, issueDate = new Date()) => {
  try {
    // Step 1-2: Check whether MemberID exists in the Members Database
    const member = await Member.findOne({ memberId });
    if (!member) {
      return {
        success: false,
        message: 'Invalid Member ID',
        code: 'INVALID_MEMBER_ID'
      };
    }

    // Step 3-5: Check whether member status is Active
    if (member.status !== 'Active') {
      return {
        success: false,
        message: 'Member Account Inactive',
        code: 'MEMBER_INACTIVE'
      };
    }

    // Step 6-7: Count the number of books currently issued to the member
    const issuedBooksCount = await Transaction.countDocuments({
      memberId: member.memberId,
      status: { $in: ['Issued', 'Overdue'] }
    });

    if (issuedBooksCount >= member.maxBorrowLimit) {
      return {
        success: false,
        message: 'Borrow Limit Exceeded',
        code: 'BORROW_LIMIT_EXCEEDED'
      };
    }

    // Step 8-9: Check whether BookID exists in the Books Database
    const book = await Book.findOne({ bookId });
    if (!book) {
      return {
        success: false,
        message: 'Invalid Book ID',
        code: 'INVALID_BOOK_ID'
      };
    }

    // Step 10-11: Check availability of the book (available copies > 0)
    if (book.availableCopies <= 0) {
      return {
        success: false,
        message: 'Book Not Available',
        code: 'BOOK_NOT_AVAILABLE'
      };
    }

    // Step 12: Calculate DueDate = IssueDate + Maximum Borrow Days
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + book.maxBorrowDays);

    // Step 13: Create a new transaction record
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

    // Step 14: Decrease available book copies by 1
    book.availableCopies -= 1;
    await book.save();

    // Step 15: Display "Book Issued Successfully" with DueDate
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
  } catch (error) {
    console.error('Error in issueBook:', error);
    return {
      success: false,
      message: 'Error processing book issue',
      code: 'SYSTEM_ERROR',
      error: error.message
    };
  }
};

module.exports = {
  issueBook
};
