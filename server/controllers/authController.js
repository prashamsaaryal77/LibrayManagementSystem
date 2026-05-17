const crypto = require('crypto');
const Member = require('../models/Member');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;

  const currentHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(currentHash, 'hex'));
};

const generateToken = (user) => {
  const payload = Buffer.from(
    JSON.stringify({
      id: user._id,
      email: user.email,
      role: user.role,
      ts: Date.now(),
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', process.env.AUTH_SECRET || 'library-management-secret')
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  memberId: user.memberId,
  role: user.role,
  status: user.status,
  maxBorrowLimit: user.maxBorrowLimit,
  borrowedBooks: user.borrowedBooks || [],
  fines: user.fines || 0,
});

const generateMemberId = async () => {
  const count = await Member.countDocuments({ role: 'Member' });
  const numericPart = (count + 1).toString().padStart(5, '0');
  return `MEM${numericPart}`;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const errors = [];

    if (!name || !name.trim()) {
      errors.push('Name is required');
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (/\d/.test(name.trim())) {
      errors.push('Name cannot contain numbers');
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      errors.push('A valid email is required');
    } else if (/^\d/.test(email)) {
      errors.push('Email address cannot start with a number');
    }

    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await Member.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    // Generate member ID for new members
    const memberId = await generateMemberId();

    const user = await Member.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: 'Member',
      memberId: memberId,
      status: 'Active',
      maxBorrowLimit: 3,
      borrowedBooks: [],
      fines: 0,
    });

    return res.status(201).json({
      message: 'Registration successful! You are now a member.',
      token: generateToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to register user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await Member.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      token: generateToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to login' });
  }
};
