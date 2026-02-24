const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// Routes
router.post('/', memberController.createMember);
router.get('/', memberController.getAllMembers);
router.get('/:memberId', memberController.getMemberById);
router.put('/:memberId', memberController.updateMember);
router.put('/:memberId/status', memberController.updateMemberStatus);

module.exports = router;
