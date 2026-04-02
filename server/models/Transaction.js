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
  },
  bookId: {
    type: String,
    required: true,
    ref: 'Book',
  },
  borrowDate: {
    type: Date,
    default: null,
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now,
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
    min: 0,
  },
  finePaid: {
    type: Boolean,
    default: true,
  },
  fineClearedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

transactionSchema.pre('save', function (next) {
  if (!this.borrowDate) {
    this.borrowDate = this.issueDate;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
