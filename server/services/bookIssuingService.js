const Member = require('../models/Member');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

const SYSTEM_PASS_LIMIT = 3;

// Implements the library issue flow with system-pass checks
const issueBook = async (memberId, bookId, issueDate = new Date()) => {
  try {
    const user = await Member.findOne({ memberId });
    if (!user) {
      return {
        success: false,
        message: 'Invalid Member ID',
        code: 'INVALID_MEMBER_ID',
      };
    }

    if (user.status !== 'Active') {
      return {
        success: false,
        message: 'Member Account Inactive',
        code: 'MEMBER_INACTIVE',
      };
    }

    if ((user.fines || 0) > 0) {
      return {
        success: false,
        message: 'System Pass Failed: unpaid fines must be cleared before borrowing',
        code: 'UNPAID_FINES',
      };
    }

    const issuedBooksCount = await Transaction.countDocuments({
      memberId: user.memberId,
      status: { $in: ['Issued', 'Overdue'] },
    });

    const borrowLimit = Math.min(user.maxBorrowLimit || SYSTEM_PASS_LIMIT, SYSTEM_PASS_LIMIT);

    if (issuedBooksCount >= borrowLimit) {
      return {
        success: false,
        message: `System Pass Failed: members can borrow fewer than ${borrowLimit + 1} active books`,
        code: 'BORROW_LIMIT_EXCEEDED',
      };
    }

    const book = await Book.findOne({ bookId });
    if (!book) {
      return {
        success: false,
        message: 'Invalid Book ID',
        code: 'INVALID_BOOK_ID',
      };
    }

    if (book.availableCopies <= 0) {
      return {
        success: false,
        message: 'Book Not Available',
        code: 'BOOK_NOT_AVAILABLE',
      };
    }

    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + book.maxBorrowDays);

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const transaction = new Transaction({
      transactionId,
      memberId: user.memberId,
      bookId: book.bookId,
      borrowDate: issueDate,
      issueDate,
      dueDate,
      status: 'Issued',
      fineAmount: 0,
      finePaid: true,
    });

    await transaction.save();

    book.availableCopies -= 1;
    await book.save();

    member.borrowedBooks.push({
      bookId: book.bookId,
      borrowedAt: issueDate,
      dueDate,
    });
    await member.save();

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
        maxBorrowDays: book.maxBorrowDays,
        systemPass: true,
      },
    };
  } catch (error) {
    console.error('Error in issueBook:', error);
    return {
      success: false,
      message: 'Error processing book issue',
      code: 'SYSTEM_ERROR',
      error: error.message,
    };
  }
};

module.exports = {
  issueBook,
};
