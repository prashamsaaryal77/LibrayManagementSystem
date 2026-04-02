const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Routes
router.post('/', bookController.createBook);
router.get('/search', bookController.searchBooks);
router.get('/', bookController.getAllBooks);
router.get('/:bookId', bookController.getBookById);
router.put('/:bookId', bookController.updateBook);

module.exports = router;
