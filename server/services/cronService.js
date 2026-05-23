const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Member = require('../models/Member');

let transporter = null;

// Create an Ethereal test account automatically — no config needed!
const getTransporter = async () => {
    if (transporter) return transporter;

    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
    console.log(`✓ Ethereal test email: ${testAccount.user}`);
    return transporter;
};

const sendDueReminders = async () => {
    try {
        const reminderDays = parseInt(process.env.DUE_REMINDER_DAYS) || 3;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thresholdDate = new Date(today);
        thresholdDate.setDate(thresholdDate.getDate() + reminderDays);
        thresholdDate.setHours(23, 59, 59, 999);

        console.log(`Cron: Checking dues between ${today.toLocaleDateString()} and ${thresholdDate.toLocaleDateString()}`);

        const members = await Member.find({ 'borrowedBooks.0': { $exists: true } });

        if (members.length === 0) {
            console.log('Cron: No members with borrowed books.');
            return;
        }

        const mailer = await getTransporter();

        console.log(members, "member")

        for (const member of members) {
            let booksToRemind = [];

            console.log(`Cron: Member=${member.name}, borrowedBooks=${member.borrowedBooks.length}`);
            for (const book of member.borrowedBooks) {
                const dueDate = new Date(book.dueDate);
                console.log(`  → Book=${book.bookId}, dueDate=${dueDate.toISOString()}, reminderSent=${book.reminderSent}`);
                if (book.reminderSent !== true && dueDate >= today && dueDate <= thresholdDate) {
                    booksToRemind.push(book);
                }
            }

            if (booksToRemind.length === 0) continue;

            const bookList = booksToRemind.map(b =>
                `<li><strong>${b.title || b.bookId}</strong> — due ${new Date(b.dueDate).toLocaleDateString()}</li>`
            ).join('');

            const info = await mailer.sendMail({
                from: '"Library System" <library@test.com>',
                to: member.email,
                subject: 'Library Book Due Reminder',
                html: `<p>Hello ${member.name},</p><p>These books are due soon:</p><ul>${bookList}</ul><p>Please return them on time!</p>`,
            });

            // Mark as sent
            for (const book of booksToRemind) {
                book.reminderSent = true;
            }
            await member.save();

            // Click this link to SEE the email in your browser!
            console.log(`✉ Reminder sent to ${member.email}`);
            console.log(`  → Preview: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (err) {
        console.error('Cron error:', err);
    }
};

// Run every minute for testing
cron.schedule('* * * * *', () => {
    console.log('Running due reminders check...');
    sendDueReminders();
});

console.log('✓ Cron Service Initialized (Ethereal test mode)');

module.exports = { sendDueReminders };
