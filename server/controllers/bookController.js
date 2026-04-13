const Book = require('../models/Book');

const buildBookFilters = ({ query, title, author, isbn, status } = {}) => {
  const andConditions = [];

  if (query) {
    const regex = new RegExp(query, 'i');
    andConditions.push({
      $or: [
        { title: regex },
        { author: regex },
        { isbn: regex },
        { bookId: regex },
        { status: regex },
      ],
    });
  }

  if (title) {
    andConditions.push({ title: new RegExp(title, 'i') });
  }

  if (author) {
    andConditions.push({ author: new RegExp(author, 'i') });
  }

  if (isbn) {
    andConditions.push({ isbn: new RegExp(isbn, 'i') });
  }

  if (status) {
    andConditions.push({ status });
  }

  return andConditions.length > 0 ? { $and: andConditions } : {};
};

// Create a new book
exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, totalCopies, maxBorrowDays } = req.body;

    if (!title || !author || !isbn || totalCopies === undefined) {
      return res.status(400).json({ error: 'Missing required fields: title, author, isbn, totalCopies' });
    }

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ error: 'Book with this ISBN already exists' });
    }

    const numericCopies = Number(totalCopies);

    const book = new Book({
      title,
      author,
      isbn,
      totalCopies: numericCopies,
      availableCopies: numericCopies,
      maxBorrowDays: maxBorrowDays || 14,
    });

    await book.save();
    res.status(201).json({
      message: 'Book created successfully',
      data: book,
      bookId: book.bookId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search books by details
exports.searchBooks = async (req, res) => {
  try {
    const filters = buildBookFilters(req.query);
    const books = await Book.find(filters).sort({ borrowCount: -1, createdAt: -1 });

    res.json({
      count: books.length,
      data: books,
      filters: req.query,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const filters = buildBookFilters(req.query);
    const books = await Book.find(filters).sort({ borrowCount: -1, createdAt: -1 });
    res.json({ count: books.length, data: books });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findOne({
      $or: [{ bookId }, { isbn: bookId }],
    });

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
    const { title, author, isbn, totalCopies, maxBorrowDays } = req.body;

    const book = await Book.findOne({ bookId });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (totalCopies !== undefined) {
      const numericTotalCopies = Number(totalCopies);
      const copiesDifference = numericTotalCopies - book.totalCopies;
      book.availableCopies = Math.max(0, book.availableCopies + copiesDifference);
      book.totalCopies = numericTotalCopies;
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (isbn) book.isbn = isbn;
    if (maxBorrowDays) book.maxBorrowDays = maxBorrowDays;

    await book.save();

    res.json({
      message: 'Book updated successfully',
      data: book,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
