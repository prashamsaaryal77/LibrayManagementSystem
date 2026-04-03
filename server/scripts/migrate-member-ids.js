const mongoose = require('mongoose');
const Member = require('../models/Member');
require('dotenv').config();

const generateMemberId = async () => {
  const count = await Member.countDocuments({ role: 'Member' });
  const numericPart = (count + 1).toString().padStart(5, '0');
  return `MEM${numericPart}`;
};

async function migrateMemberIds() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library-management';
    await mongoose.connect(mongoURI);
    console.log('✓ MongoDB Connected');

    // Find all members without memberId
    const membersWithoutId = await Member.find({
      role: 'Member',
      $or: [
        { memberId: { $exists: false } },
        { memberId: null },
        { memberId: '' }
      ]
    });

    console.log(`Found ${membersWithoutId.length} members without memberId`);

    for (const member of membersWithoutId) {
      const memberId = await generateMemberId();
      await Member.updateOne(
        { _id: member._id },
        { $set: { memberId: memberId } }
      );
      console.log(`Updated member ${member.name} with memberId ${memberId}`);
    }

    console.log('✓ Migration completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✓ MongoDB Disconnected');
  }
}

migrateMemberIds();