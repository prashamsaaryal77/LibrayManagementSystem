const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Routes
router.post('/issue', transactionController.issueBook);
router.post('/borrow', transactionController.borrowBook);
router.post('/return', transactionController.returnBook);
router.put('/return/:transactionId', transactionController.returnBorrowedBook);
router.post('/pay-fine', transactionController.payFine);
router.get('/', transactionController.getAllTransactions);
router.get('/overdue', transactionController.getOverdueBooks);
router.get('/member/:memberId', transactionController.getMemberTransactions);
router.get('/:transactionId', transactionController.getTransactionById);

module.exports = router;
