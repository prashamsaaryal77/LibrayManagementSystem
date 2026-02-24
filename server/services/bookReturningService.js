const Transaction = require('../models/Transaction');
const Book = require('../models/Book');

const FINE_PER_DAY = 10; // Fine amount per day in rupees/currency

const returnBook = async (transactionId, returnDate = new Date()) => {
  try {
    // Find the transaction
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return {
        success: false,
        message: 'Invalid Transaction ID',
        code: 'INVALID_TRANSACTION_ID'
      };
    }

    // Check if already returned
    if (transaction.status === 'Returned') {
      return {
        success: false,
        message: 'Book Already Returned',
        code: 'ALREADY_RETURNED'
      };
    }

    // Calculate fine if overdue
    let fineAmount = 0;
    let status = 'Returned';

    if (returnDate > transaction.dueDate) {
      const overdueDays = Math.floor((returnDate - transaction.dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = overdueDays * FINE_PER_DAY;
    }

    // Update transaction
    transaction.returnDate = returnDate;
    transaction.status = status;
    transaction.fineAmount = fineAmount;
    await transaction.save();

    // Increase available book copies by 1
    const book = await Book.findOne({ bookId: transaction.bookId });
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    return {
      success: true,
      message: 'Book Returned Successfully',
      code: 'RETURN_SUCCESS',
      data: {
        transactionId,
        bookTitle: book.title,
        issueDate: transaction.issueDate,
        dueDate: transaction.dueDate,
        returnDate,
        fineAmount,
        message: fineAmount > 0 ? `Fine of ${fineAmount} charged for ${Math.floor((returnDate - transaction.dueDate) / (1000 * 60 * 60 * 24))} overdue days` : 'Returned on time'
      }
    };
  } catch (error) {
    console.error('Error in returnBook:', error);
    return {
      success: false,
      message: 'Error processing book return',
      code: 'SYSTEM_ERROR',
      error: error.message
    };
  }
};

module.exports = {
  returnBook,
  FINE_PER_DAY
};
