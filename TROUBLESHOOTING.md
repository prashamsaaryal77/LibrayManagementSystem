# Troubleshooting Guide

## Common Issues & Solutions

### 1. MongoDB Connection Issues

#### Issue: "✗ MongoDB Connection Error"

**Cause:** MongoDB service is not running or connection string is incorrect.

**Solution:**

```bash
# Check if MongoDB is running
# macOS/Linux
brew services list
brew services start mongodb-community

# Windows
net start MongoDB

# Or start MongoDB manually
mongod

# Test connection
mongosh
```

**Update .env.local:**
```env
# Local
MONGODB_URI=mongodb://localhost:27017/library-management

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library-management?retryWrites=true&w=majority
```

**Verify Connection:**
- Check MongoDB is running: `mongosh`
- Use MongoDB Compass GUI to test connection
- Check firewall/antivirus blocking port 27017

---

### 2. Backend Server Issues

#### Issue: "Cannot start backend / Port already in use"

**Cause:** Port 5000 is already in use.

**Solution:**

```bash
# Find process using port 5000
# macOS/Linux
lsof -i :5000

# Windows
netstat -ano | findstr :5000

# Kill the process
# macOS/Linux
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

**Or use different port:**
```bash
# .env.local
PORT=5001

# Update frontend
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

#### Issue: Backend starts but throws errors

**Check:**
1. MongoDB connection (see above)
2. Node.js version: `node --version` (should be 16+)
3. Dependencies installed: `cd server && npm install`
4. Package.json exists in `/server` folder

**Debug:**
```bash
cd server
npm run dev  # Shows detailed errors
```

---

### 3. Frontend Issues

#### Issue: "Cannot GET /admin/members"

**Cause:** Frontend page doesn't exist or routing issue.

**Solution:**
1. Make sure you're accessing `http://localhost:3000`
2. Check `.next` folder exists (build cache)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Restart frontend:
```bash
pnpm dev
```

---

#### Issue: "Failed to load members" or "Network Error"

**Cause:** Frontend can't connect to backend API.

**Solution:**

1. **Check backend is running:**
```bash
# Try accessing API directly
curl http://localhost:5000/api/members
```

2. **Check API URL in .env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. **Check CORS configuration** in `/server/server.js`:
```javascript
app.use(cors());  // Should allow localhost:3000
```

4. **Browser DevTools (F12):**
   - Network tab → Check API requests
   - Console tab → Check error messages
   - Look for 404, 503, or CORS errors

---

### 4. API Request Issues

#### Issue: "POST /api/transactions/issue returns 400"

**Response might be:**
```json
{
  "error": "Invalid Member ID",
  "code": "INVALID_MEMBER_ID"
}
```

**Check:**
1. Member exists: `db.members.findOne({memberId: "MEM001"})`
2. Member is Active: `status: "Active"`
3. Member under borrow limit
4. Book exists: `db.books.findOne({bookId: "BOOK001"})`
5. Book has available copies

---

#### Issue: "API returns 500 Server Error"

**Check backend terminal for error details.**

Common causes:
```
1. MongoDB query failed
2. Missing validation
3. Database save error
4. Null pointer exception
```

**Debug with logs:**
```javascript
// Add in controller before operation
console.log("[v0] Request received:", req.body);
console.log("[v0] Processing...");
```

---

### 5. Data Issues

#### Issue: "Members not showing in list"

**Check:**
```javascript
// MongoDB shell
use library-management
db.members.count()  // Should be > 0
db.members.find()   // View all members
```

**If empty:**
- Add members through UI: `/admin/members`
- Or insert via MongoDB shell:
```javascript
db.members.insertOne({
  memberId: "MEM001",
  name: "Test User",
  email: "test@example.com",
  phone: "1234567890",
  status: "Active",
  maxBorrowLimit: 5,
  createdAt: new Date()
})
```

---

#### Issue: "Transaction not saving after issue book"

**Check API response:**
- Browser DevTools → Network tab
- Click issue request → Response tab
- Should see:
```json
{
  "success": true,
  "message": "Book Issued Successfully",
  "data": {...}
}
```

**If error:**
- Check borrow limit
- Check book availability
- Check MongoDB connection

---

### 6. Frontend Display Issues

#### Issue: "Form not submitting / Button not responsive"

**Check:**
1. Browser console (F12) for JavaScript errors
2. Network requests being sent
3. Loading state (button disabled while submitting)

**Try:**
```bash
# Clear browser cache
Ctrl+Shift+Delete  # Windows
Cmd+Shift+Delete   # macOS

# Restart frontend
pnpm dev
```

---

#### Issue: "Styling looks broken / missing Tailwind CSS"

**Check:**
1. Tailwind CSS is configured in `tailwind.config.ts`
2. Global CSS imported in `app/layout.tsx`
3. shadcn/ui components have correct class names

**Fix:**
```bash
# Rebuild CSS
pnpm dev

# Clear build cache
rm -rf .next
pnpm dev
```

---

### 7. Environment Variables Issues

#### Issue: "NEXT_PUBLIC_API_URL not found"

**Check:**
1. `.env.local` file exists in project root
2. Has correct content:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Restarted frontend after changing:
```bash
# Stop pnpm dev
# Update .env.local
pnpm dev  # Restart
```

---

#### Issue: "MongoDB connection string not found"

**Check in /server:**
1. `.env.local` or create it with:
```env
MONGODB_URI=mongodb://localhost:27017/library-management
```

2. Restarted backend server

---

### 8. Algorithm Testing Issues

#### Issue: "All books showing as unavailable"

**Check:**
```javascript
// MongoDB shell
db.books.updateOne(
  {bookId: "BOOK001"},
  {$set: {availableCopies: 3}}
)
```

---

#### Issue: "Borrow limit not working"

**Verify:**
```javascript
// Check member limit
db.members.findOne({memberId: "MEM001"})
// Should show: maxBorrowLimit: 5

// Check issued count
db.transactions.countDocuments({
  memberId: "MEM001",
  status: {$in: ["Issued", "Overdue"]}
})
```

---

### 9. Performance Issues

#### Issue: "Application is slow / loading slowly"

**Check:**
1. Network tab (F12) - API response times
2. Console for errors causing re-renders
3. MongoDB connection - might be slow

**Optimize:**
```bash
# Restart fresh
pnpm dev  # Frontend
cd server && npm run dev  # Backend
```

---

#### Issue: "Database queries too slow"

**Verify indexes exist:**
```javascript
db.members.getIndexes()
db.books.getIndexes()
```

**Should have indexes on:**
- memberId
- bookId
- email (unique)
- isbn (unique)

---

### 10. Deployment Issues

#### Issue: "Works locally but not on deployed version"

**Check:**
1. Environment variables set on production
   - `NEXT_PUBLIC_API_URL` pointing to backend URL
   - `MONGODB_URI` pointing to MongoDB Atlas
2. CORS configuration for production URL
3. Backend running and accessible

**Update CORS:**
```javascript
// server.js
const corsOptions = {
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
};
app.use(cors(corsOptions));
```

---

## Debugging Techniques

### 1. Check Browser Console
```
F12 → Console tab
Look for red error messages
```

### 2. Check Network Requests
```
F12 → Network tab
Click on API request
Check Status (should be 200, 201, or 400)
Check Response JSON
```

### 3. Check Backend Logs
```bash
# Terminal running backend
Look for error messages
Should see "✓ MongoDB Connected"
Should see "✓ Server running on port 5000"
```

### 4. Check MongoDB Data
```bash
mongosh
use library-management
db.members.find()
db.books.find()
db.transactions.find()
```

### 5. Add Debug Logs
```javascript
// In frontend components
console.log("[v0] Component rendered:", props);

// In backend controllers
console.log("[v0] Received request:", req.body);
```

---

## Quick Fixes Checklist

- [ ] MongoDB running? `mongod` or `brew services start mongodb-community`
- [ ] Backend running? `cd server && npm run dev`
- [ ] Frontend running? `pnpm dev`
- [ ] `.env.local` configured correctly?
- [ ] Ports available? 3000 and 5000 not in use?
- [ ] Data created? At least one member and book?
- [ ] Browser cache cleared? Ctrl+Shift+Delete
- [ ] Check browser console (F12)?
- [ ] Check backend terminal for errors?
- [ ] MongoDB connection tested?

---

## Getting Help

1. **Check browser console** (F12) for detailed error
2. **Check backend terminal** for server errors
3. **Check MongoDB** - is data there?
4. **Read error message carefully** - usually explains the issue
5. **Check API response** - Network tab shows exact error
6. **Review QUICKSTART.md** - verify you followed all steps

---

## Contact Points

- Browser Console (F12) - JavaScript/API errors
- Backend Terminal - Server/MongoDB errors
- Network Tab (F12) - HTTP request details
- MongoDB Compass - Database content
- Documentation files:
  - QUICKSTART.md - Setup
  - LIBRARY_SETUP.md - Architecture
  - ALGORITHM.md - Algorithm details

---

**Most common issues:**
1. ❌ MongoDB not running → Start with `mongod`
2. ❌ Backend not running → `cd server && npm run dev`
3. ❌ Frontend API URL wrong → Check `.env.local`
4. ❌ No data created → Add members/books first
5. ❌ Port already in use → Kill process or use different port

**Start simple, verify each step, read error messages carefully!**
