require('dotenv').config();
const dns = require('dns');
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
const { resolve } = require('path');
let storedVerificationCode;

async function checkEmailDomain(email) {
  domain = email.split('@')[1];

  return new Promise((resolve) => {
    dns.resolveMx(domain, (error, addresses) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

router.post('/send_email', async (req, res) => {
  storedVerificationCode = (Math.floor(Math.random() * 900000) + 100000).toString().replace(/(\d{3})(\d{3})/, "$1-$2");
  
  name = req.body.name;
  surname = req.body.surname;
  email = req.body.email;

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(process.env.DB_TABLE_NAME);

    const userExists = await collection.findOne({
      email: email,
    });

    if (userExists) {
      await client.close();
      return res.status(400).send('Email already verified');
    }

    const domainExists = await checkEmailDomain(email);
    if (domainExists) {

      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Verification code: ${storedVerificationCode}`,
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              p {
                color: black;
              }
              .code {
                display: inline-block;
                background-color: lightgray;
                border-radius: 7px;
                padding: 6px;
              }
              .code strong {
                display: block;
              }
            </style>
          </head>
          <body>
            <p>Hello ${name} ${surname},</p>
            <p>Your verification code is:</p>
            <div class="code">
              <strong>${storedVerificationCode}</strong>
            </div>
          </body>
        </html>`
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
          res.status(500).send("Email wasn't sent");
        } else {
          res.status(200).send('Email sent 🎉');
        }
      });
    } else {
      res.status(500).send("Email domain doesn't exist");
    }
    await client.close();
  } catch (error) {
    console.error('Error with communicating to database:', error);
    return res.status(501).send('Error with communicating to database');
  }
});

router.post('/verify', async (req, res) => {
  const verificationCode = req.body.verificationCode;

  if (verificationCode === storedVerificationCode) {

    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const database = client.db(process.env.DB_NAME);
      const collection = database.collection(process.env.DB_TABLE_NAME);
      
      // Your timezone
      const pragueTimezoneOptions = {
        timeZone: 'Europe/Prague',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
    
      const verifiedAt = new Date().toLocaleString('en-GB', pragueTimezoneOptions);
      
      const uniqueId = generateRandomString(16);
      
      const user = {
        _id: `${surname.toLowerCase()}-${uniqueId.toLowerCase()}`,
        name: name,
        surname: surname,
        email: email,
        verified_at: verifiedAt
      };

      await collection.insertOne(user);

      const mailOptions = {
        from: process.env.EMAIL_LOG_FROM,
        to: process.env.EMAIL_LOG_TO,
        subject: process.env.EMAIL_LOG_SUBJECT,
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              p {
                color: black;
              }
              h2 {
                color: black;
              }
            </style>
          </head>
          <body>
            <h2>Copy of saved data:</h2>
            <p><strong>Name: </strong>${user.name}</p>
            <p><strong>Surname: </strong>${user.surname}</p>
            <p><strong>Email: </strong>${user.email}</p>
            <p><strong>Verified at: </strong>${user.verified_at}</p>
          </body>
        </html>`
      };
  
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        }
      });

      if (process.env.SEND_CONFIRMATION_MAIL === "1") {
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: `Your email has been verified`,
          html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                p {
                  color: black;
                }
                h2 {
                  color: black;
                }
              </style>
            </head>
            <body>
              <p>Hello ${name} ${surname},</p>
              <p>your email has been verified.</p>               
            </body>
          </html>`
        };
    
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          }
        });
      }

      res.status(200).send('Verified');
      storedVerificationCode = null;
    } catch (error) {
      console.error('Error while saving user data:', error);
      res.status(500).send('Error while saving user data');
    } finally {
      await client.close();
    }
  } else {
    res.status(400).send('Wrong code');
  }
});

module.exports = router;
