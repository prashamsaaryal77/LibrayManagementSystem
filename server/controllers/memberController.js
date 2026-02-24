const Member = require('../models/Member');

// Create a new member
exports.createMember = async (req, res) => {
  try {
    const { memberId, name, email, phone, status, maxBorrowLimit } = req.body;

    // Validation
    if (!memberId || !name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if member already exists
    const existingMember = await Member.findOne({ memberId });
    if (existingMember) {
      return res.status(400).json({ error: 'Member ID already exists' });
    }

    const member = new Member({
      memberId,
      name,
      email,
      phone,
      status: status || 'Active',
      maxBorrowLimit: maxBorrowLimit || 5
    });

    await member.save();
    res.status(201).json({
      message: 'Member created successfully',
      data: member
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json({ count: members.length, data: members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get member by ID
exports.getMemberById = async (req, res) => {
  try {
    const { memberId } = req.params;
    const member = await Member.findOne({ memberId });

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
      { memberId },
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
      { memberId },
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
