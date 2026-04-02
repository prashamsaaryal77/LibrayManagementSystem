const Member = require('../models/Member');

// Get all members (users with role='Member')
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find({ role: 'Member' }).sort({ createdAt: -1 });
    res.json({ count: members.length, data: members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get member by ID
exports.getMemberById = async (req, res) => {
  try {
    const { memberId } = req.params;
    const member = await Member.findOne({ memberId, role: 'Member' });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ data: member });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update member
exports.updateMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { name, email, phone, maxBorrowLimit } = req.body;

    const member = await Member.findOneAndUpdate(
      { memberId, role: 'Member' },
      { name, email, phone, maxBorrowLimit },
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({
      message: 'Member updated successfully',
      data: member
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update member status
exports.updateMemberStatus = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const member = await Member.findOneAndUpdate(
      { memberId, role: 'Member' },
      { status },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({
      message: 'Member status updated successfully',
      data: member
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
