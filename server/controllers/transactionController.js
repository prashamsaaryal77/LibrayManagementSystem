const Transaction = require('../models/Transaction');
const { issueBook } = require('../services/bookIssuingService');
const { returnBook } = require('../services/bookReturningService');

// Issue book (implements the 16-step algorithm)
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
        code: result.code
      });
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Return book
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
        code: result.code
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 });
    res.json({ count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get member transaction history
exports.getMemberTransactions = async (req, res) => {
  try {
    const { memberId } = req.params;
    const transactions = await Transaction.find({ memberId })
      .sort({ createdAt: -1 });

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
      status: { $in: ['Issued', 'Overdue'] }
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
    const transaction = await Transaction.findOne({ transactionId });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ data: transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
