const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Member = require('../models/Member');
const Book = require('../models/Book');
const { issueBook } = require('../services/bookIssuingService');
const { returnBook, FINE_PER_DAY } = require('../services/bookReturningService');

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const sanitizeUser = (member) => ({
  id: member._id,
  name: member.name,
  email: member.email,
  memberId: member.memberId,
  role: member.role,
  borrowedBooks: member.borrowedBooks || [],
  fines: member.fines || 0,
});

const buildTransactionId = () => `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

// Existing member issue flow
exports.issueBook = async (req, res) => {
  try {
    const { memberId, bookId, issueDate } = req.body;

    if (!memberId || !bookId) {
      return res.status(400).json({ error: 'memberId and bookId are required' });
    }

    const result = await issueBook(memberId, bookId, issueDate ? new Date(issueDate) : new Date());

    if (!result.success) {
      return res.status(400).json({
        error: result.message,
        code: result.code,
      });
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New member borrow flow with system-pass checks
exports.borrowBook = async (req, res) => {
  try {
    const { memberId, bookId } = req.body;
    console.log('Borrow book request:', { memberId, bookId });

    if (!memberId || !bookId) {
      return res.status(400).json({ error: 'memberId and bookId are required' });
    }

    const member = await Member.findOne({ memberId });
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const book = await Book.findOne({ $or: [{ bookId }, { isbn: bookId }] });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const borrowLimit = Number(process.env.BORROW_LIMIT) || 3;
    if ((member.borrowedBooks || []).length >= borrowLimit) {
      return res.status(400).json({ error: `System Pass Failed: a member can borrow up to ${borrowLimit} books at a time` });
    }

    if ((member.fines || 0) > 0) {
      return res.status(400).json({ error: 'System Pass Failed: clear unpaid fines before borrowing another book' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ error: 'Book is currently unavailable' });
    }

    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + (book.maxBorrowDays || 14));

    console.log('Creating transaction with:', {
      transactionId: buildTransactionId(),
      memberId: member.memberId,
      bookId: book.bookId,
      borrowDate,
      issueDate: borrowDate,
      dueDate,
      status: 'Issued',
    });

    const transaction = await Transaction.create({
      transactionId: buildTransactionId(),
      memberId: member.memberId,
      bookId: book.bookId,
      borrowDate,
      issueDate: borrowDate,
      dueDate,
      returnDate: null,
      fineAmount: 0,
      finePaid: true,
      status: 'Issued',
    });

    console.log('Transaction created:', transaction);

    member.borrowedBooks.push({
      bookId: book.bookId,
      title: book.title,
      borrowedAt: borrowDate,
      dueDate,
    });
    await member.save();

    book.availableCopies -= 1;
    book.borrowCount += 1;
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      data: {
        transaction,
        user: sanitizeUser(member),
        book,
      },
    });
  } catch (error) {
    console.error('Error in borrowBook:', error);
    res.status(500).json({ error: error.message });
  }
};

// Existing member return flow
exports.returnBook = async (req, res) => {
  try {
    const { transactionId, returnDate } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId is required' });
    }

    const result = await returnBook(transactionId, returnDate ? new Date(returnDate) : new Date());

    if (!result.success) {
      return res.status(400).json({
        error: result.message,
        code: result.code,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New user return and fine logic
exports.returnBorrowedBook = async (req, res) => {
  try {
    const transactionId = req.params.transactionId || req.body.transactionId;
    const returnDate = req.body.returnDate ? new Date(req.body.returnDate) : new Date();

    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId is required' });
    }

    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status === 'Returned') {
      return res.status(400).json({ error: 'This book has already been returned' });
    }

    const overdueMs = returnDate.getTime() - new Date(transaction.dueDate).getTime();
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

    let user = null;
    if (transaction.memberId) {
      user = await Member.findOne({ memberId: transaction.memberId });
      if (user) {
        user.borrowedBooks = (user.borrowedBooks || []).filter(
          (borrowedBook) => borrowedBook.bookId !== transaction.bookId
        );
        user.fines = Number(user.fines || 0) + fineAmount;
        await user.save();
      }
    }

    res.json({
      success: true,
      message: fineAmount > 0 ? 'Book returned and fine applied successfully' : 'Book returned successfully',
      data: {
        transaction,
        overdueDays,
        fineAmount,
        fineRate: FINE_PER_DAY,
        user: user ? sanitizeUser(user) : null,
        book,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fine payment route
exports.payFine = async (req, res) => {
  try {
    const { memberId, transactionId, amount } = req.body;

    if (!memberId && !transactionId) {
      return res.status(400).json({ error: 'memberId or transactionId is required' });
    }

    const numericAmount = Number(amount || 0);
    if (numericAmount <= 0) {
      return res.status(400).json({ error: 'A valid payment amount is required' });
    }

    const transaction = transactionId ? await Transaction.findOne({ transactionId }) : null;

    let account = null;

    if (memberId) {
      account = await Member.findOne({ memberId });
    }

    if (!account && transaction?.memberId) {
      account = await Member.findOne({ memberId: transaction.memberId });
    }

    if (!account) {
      return res.status(404).json({ error: 'Account with outstanding fines was not found' });
    }

    const outstandingFine = transaction && transaction.fineAmount > 0 && !transaction.finePaid
      ? transaction.fineAmount
      : Number(account.fines || 0);

    if (outstandingFine <= 0) {
      return res.status(400).json({ error: 'No unpaid fines found for this account' });
    }

    if (numericAmount < outstandingFine) {
      return res.status(400).json({ error: `Payment amount must be at least ${outstandingFine}` });
    }

    account.fines = Math.max(0, Number(account.fines || 0) - outstandingFine);
    await account.save();

    const fineClearedAt = new Date();

    if (transaction) {
      transaction.finePaid = true;
      transaction.fineClearedAt = fineClearedAt;
      await transaction.save();
    } else {
      await Transaction.updateMany(
        { memberId: account.memberId, fineAmount: { $gt: 0 }, finePaid: false },
        { $set: { finePaid: true, fineClearedAt } }
      );
    }

    res.json({
      success: true,
      message: 'Fine payment processed successfully',
      data: {
        fineCleared: true,
        paidAmount: numericAmount,
        remainingFines: account.fines || 0,
        user: sanitizeUser(account),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { status, memberId } = req.query;
    const filters = {};

    if (status) {
      filters.status = status;
    }

    if (memberId) {
      filters.memberId = memberId;
    }

    const transactions = await Transaction.find(filters).sort({ createdAt: -1 });
    res.json({ count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get member transaction history
exports.getMemberTransactions = async (req, res) => {
  try {
    const { memberId } = req.params;
    console.log('Getting transactions for memberId:', memberId);

    const transactions = await Transaction.find({ memberId }).sort({ createdAt: -1 });
    console.log('Found transactions:', transactions.length);

    res.json({ count: transactions.length, data: transactions });
  } catch (error) {
    console.error('Error in getMemberTransactions:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user transactions by memberId
exports.getUserTransactions = async (req, res) => {
  try {
    const { memberId } = req.params;

    const transactions = await Transaction.find({ memberId }).sort({ createdAt: -1 });

    res.json({ count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get overdue books
exports.getOverdueBooks = async (req, res) => {
  try {
    const now = new Date();
    const overdueTransactions = await Transaction.find({
      dueDate: { $lt: now },
      status: { $in: ['Issued', 'Overdue'] },
    }).sort({ dueDate: 1 });

    res.json({ count: overdueTransactions.length, data: overdueTransactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findOne(
      mongoose.Types.ObjectId.isValid(transactionId)
        ? { $or: [{ transactionId }, { _id: transactionId }] }
        : { transactionId }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ data: transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
