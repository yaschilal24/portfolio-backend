
 // server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Telegram Bot credentials
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_TOKEN || '8494726726:AAHL0PD4CzpSylrBgoX41YlwCAA3rGTxuIU';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '858356360';

// MySQL connection
const db = mysql.createConnection({
host:process.env.DB_Host,
  port:process.env.PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Connected to MySQL succsefull database');
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yasiada14@gmail.com',
    pass: 'epht sgnp qxbd dydu' // Gmail App Password
  }
});

// Contact form route
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const sql = 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)';
  db.query(sql, [name, email, message], (err, result) => {
    if (err) {
      console.error('❌ DB Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const mailOptions = {
      from: 'yasiada14@gmail.com',
      to: 'yasiada14@gmail.com',
      subject: 'New Contact Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Email Error:', error);
        return res.status(500).json({ error: 'Email failed to send' });
      } else {
        console.log('📧 Email sent:', info.response);

        // Send Telegram message
        const telegramMessage = `📬 New Contact Submission:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;
        axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage
        })
        .then(() => {
          console.log('📲 Telegram message sent');
          return res.json({ message: 'Your message was sent successfully!' });
        })
        .catch(error => {
          console.error('❌ Telegram Error occure:', error);
          return res.status(500).json({ error: 'Telegram message failed to send' });
        });
      }
    });
  });
});

const PORT = process.env.PORT || 48253;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});