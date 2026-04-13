const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  bookId: {
    type: String,
    unique: true,
    sparse: true,
  },
  bookNumber: {
    type: Number,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Borrowed'],
    default: 'Available',
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 0,
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0,
  },
  maxBorrowDays: {
    type: Number,
    default: 14,
  },
  borrowCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

bookSchema.index({ title: 'text', author: 'text', isbn: 'text', bookId: 'text' });

// Auto-generate bookId before saving
bookSchema.pre('save', async function (next) {
  this.status = this.availableCopies > 0 ? 'Available' : 'Borrowed';

  if (!this.bookNumber) {
    try {
      const lastBook = await mongoose.model('Book').findOne().sort({ bookNumber: -1 });
      this.bookNumber = (lastBook?.bookNumber || 0) + 1;
      this.bookId = `BK${String(this.bookNumber).padStart(5, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
