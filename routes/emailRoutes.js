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

router.post('/send_email', async (req, res) => {
  storedVerificationCode = (Math.floor(Math.random() * 900000) + 100000).toString().replace(/(\d{3})(\d{3})/, "$1-$2");
  
  title_before = req.body.title_before;
  name = req.body.name;
  surname = req.body.surname;
  title_after = req.body.title_after;
  icp = req.body.icp;
  email = req.body.email;
  phone = req.body.phone;

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
      return res.status(400).send('Email je již verifikován');
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
        subject: `Ověřovací kód: ${storedVerificationCode}`,
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
            <p>Dobrý den ${name} ${surname},</p>
            <p>Váš verifikační kód je:</p>
            <div class="code">
              <strong>${storedVerificationCode}</strong>
            </div>
          </body>
        </html>`
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
          res.status(500).send('Email se nepodařilo odeslat');
        } else {
          res.status(200).send('Email odeslán 🎉');
        }
      });
    } else {
      res.status(500).send('Doména neexistuje');
    }
    await client.close();
  } catch (error) {
    console.error('Chyba při komunikaci s databází:', error);
    return res.status(501).send('Chyba při komunikaci s databází');
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
    
      const user = {
        titul_pred_jmenem: "",
        jmeno: name,
        prijmeni: surname,
        titul_za_jmenem: "",
        icp: icp,
        email: email,
        telefon: "",
        cas_zaznamu: verifiedAt
      };
        
      if (title_before !== "") {
        user.titul_pred_jmenem = title_before;
      } else {
        user.titul_pred_jmenem = 'Nevyplněno'
      }
      
      if (title_after !== "") {
        user.titul_za_jmenem = title_after;
      } else {
        user.titul_za_jmenem = 'Nevyplněno'
      }
      
      if (phone !== "") {
        user.telefon = phone;
      } else {
        user.telefon = 'Nevyplněno'
      }

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
            <h2>Kopie dat uložených do databáze:</h2>
            <p><strong>Titul před jménem: </strong>${user.titul_pred_jmenem}</p>
            <p><strong>Jméno: </strong>${user.jmeno}</p>
            <p><strong>Příjmení: </strong>${user.prijmeni}</p>
            <p><strong>Titul za jménem: </strong>${user.titul_za_jmenem}</p>
            <p><strong>IČP: </strong>${user.icp}</p>
            <p><strong>Email: </strong>${user.email}</p>
            <p><strong>Telefon: </strong>${user.telefon}</p>
            <p><strong>Čas záznamu: </strong>${user.cas_zaznamu}</p>
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
          subject: `Váš email je ověřen`,
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
              <p>Dobrý den ${name} ${surname},</p>
              <p>Váš email byl právě verifikován.</p>               
            </body>
          </html>`
        };
    
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          }
        });
      }

      res.status(200).send('Ověřeno');
      storedVerificationCode = null;
    } catch (error) {
      console.error('Chyba při ukládání uživatelských informací:', error);
      res.status(500).send('Chyba při ukládání uživatelských informací');
    } finally {
      await client.close();
    }
  } else {
    res.status(400).send('Špatný kód');
  }
});

module.exports = router;
