const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Member = require('../models/Member');

const FINE_PER_DAY = 10;
const DAY_IN_MS = 1000 * 60 * 60 * 24;

const returnBook = async (transactionId, returnDate = new Date()) => {
  try {
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return {
        success: false,
        message: 'Invalid Transaction ID',
        code: 'INVALID_TRANSACTION_ID',
      };
    }

    if (transaction.status === 'Returned') {
      return {
        success: false,
        message: 'Book Already Returned',
        code: 'ALREADY_RETURNED',
      };
    }

    const overdueMs = new Date(returnDate).getTime() - new Date(transaction.dueDate).getTime();
    const overdueDays = overdueMs > 0 ? Math.ceil(overdueMs / DAY_IN_MS) : 0;
    const fineAmount = overdueDays * FINE_PER_DAY;

    transaction.returnDate = returnDate;
    transaction.status = 'Returned';
    transaction.fineAmount = fineAmount;
    transaction.finePaid = fineAmount === 0;
    transaction.fineClearedAt = fineAmount === 0 ? returnDate : null;
    await transaction.save();

    const book = await Book.findOne({ bookId: transaction.bookId });
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    if (transaction.memberId) {
      const user = await Member.findOne({ memberId: transaction.memberId });
      if (user) {
        user.borrowedBooks = (user.borrowedBooks || []).filter(
          (borrowedBook) => borrowedBook.bookId !== transaction.bookId
        );
        user.fines = Number(user.fines || 0) + fineAmount;
        await user.save();
      }
    }

    return {
      success: true,
      message: 'Book Returned Successfully',
      code: 'RETURN_SUCCESS',
      data: {
        transactionId,
        bookTitle: book?.title || transaction.bookId,
        issueDate: transaction.issueDate,
        dueDate: transaction.dueDate,
        returnDate,
        fineAmount,
        finePaid: transaction.finePaid,
        message:
          fineAmount > 0
            ? `Fine of ${fineAmount} charged for ${overdueDays} overdue day(s)`
            : 'Returned on time',
      },
    };
  } catch (error) {
    console.error('Error in returnBook:', error);
    return {
      success: false,
      message: 'Error processing book return',
      code: 'SYSTEM_ERROR',
      error: error.message,
    };
  }
};

module.exports = {
  returnBook,
  FINE_PER_DAY,
};
