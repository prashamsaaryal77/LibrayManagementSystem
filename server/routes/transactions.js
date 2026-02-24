const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Routes
router.post('/issue', transactionController.issueBook);
router.post('/return', transactionController.returnBook);
router.get('/', transactionController.getAllTransactions);
router.get('/overdue', transactionController.getOverdueBooks);
router.get('/member/:memberId', transactionController.getMemberTransactions);
router.get('/:transactionId', transactionController.getTransactionById);

module.exports = router;
