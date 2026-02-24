const Book = require('../models/Book');

// Create a new book
exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, totalCopies, maxBorrowDays } = req.body;

    // Validation
    if (!title || !author || !isbn || totalCopies === undefined) {
      return res.status(400).json({ error: 'Missing required fields: title, author, isbn, totalCopies' });
    }

    // Check if ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ error: 'Book with this ISBN already exists' });
    }

    const book = new Book({
      title,
      author,
      isbn,
      totalCopies,
      availableCopies: totalCopies,
      maxBorrowDays: maxBorrowDays || 14
    });

    await book.save();
    res.status(201).json({
      message: 'Book created successfully',
      data: book,
      bookId: book.bookId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json({ count: books.length, data: books });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findOne({ bookId });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ data: book });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, totalCopies, maxBorrowDays } = req.body;

    const book = await Book.findOne({ bookId });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // If total copies changed, adjust available copies accordingly
    if (totalCopies !== undefined) {
      const copiesDifference = totalCopies - book.totalCopies;
      book.availableCopies += copiesDifference;
      book.totalCopies = totalCopies;
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (maxBorrowDays) book.maxBorrowDays = maxBorrowDays;

    await book.save();

    res.json({
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
