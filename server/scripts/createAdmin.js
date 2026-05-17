const mongoose = require('mongoose');
const crypto = require('crypto');
const Member = require('../models/Member');

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const createAdmin = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/library-management');
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@library.com';
    const adminPassword = 'adminpassword123';

    // Check if admin exists
    const existingAdmin = await Member.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin already exists.');
      // Optional: update password to match if it already exists
      existingAdmin.passwordHash = hashPassword(adminPassword);
      existingAdmin.role = 'Admin';
      await existingAdmin.save();
      console.log('Updated existing admin password.');
    } else {
      const newAdmin = new Member({
        name: 'System Admin',
        email: adminEmail,
        passwordHash: hashPassword(adminPassword),
        role: 'Admin',
        status: 'Active',
      });
      await newAdmin.save();
      console.log('Admin user created successfully.');
    }

    console.log('\n--- ADMIN CREDENTIALS ---');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-------------------------\n');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
