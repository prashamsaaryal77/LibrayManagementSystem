const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  memberId: {
    type: String,
    required: true,
    ref: 'Member',
  },
  bookId: {
    type: String,
    required: true,
    ref: 'Book',
  },
  issueDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['Issued', 'Returned', 'Overdue'],
    default: 'Issued',
  },
  fineAmount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
