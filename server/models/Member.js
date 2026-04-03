const mongoose = require('mongoose');

const borrowedBookSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      required: true,
      trim: true,
    },
    borrowedAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const memberSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: function() { return this.role === 'Member'; }, // Only required for Members
    unique: true,
    sparse: true, // Allow null values for unique index
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
  phone: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['Admin', 'Member'],
    default: 'Member',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  maxBorrowLimit: {
    type: Number,
    default: 3,
  },
  borrowedBooks: {
    type: [borrowedBookSchema],
    default: [],
  },
  fines: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Member', memberSchema);
