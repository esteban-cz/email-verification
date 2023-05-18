<div align="center">
<table>
<tbody>
<td align="center">
<img width="2000" height="0"><br>
<sub>
  
  [![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=for-the-badge)](https://choosealicense.com/licenses/mit/)&nbsp;&nbsp;&nbsp;
  ![Maintenance](https://img.shields.io/maintenance/yes/2023?style=for-the-badge)&nbsp;&nbsp;&nbsp;
  ![GitHub last commit](https://img.shields.io/github/last-commit/esteban-cz/email-verification?style=for-the-badge)&nbsp;&nbsp;&nbsp;
  ![GitHub all releases](https://img.shields.io/github/downloads/esteban-cz/email-verification/total?style=for-the-badge)
  
</sub><br>
<img width="2000" height="0">
</td>
</tbody>
</table>
</div>
  
<br>

# **About this repo**

This app is just a snippet that has a form created in html and it has just some basic css styling. After user enter his name, surname and email he will get an email with verification code and than the user enters the verification code and if the verification code is succesfull heis data will be save to mongodb database.

<br>

## **Run locally with simple installation:**

`I created batch files for simplicity of setting up and starting the server` <br>
`You can basically set up and run this app without any knowledge of coding :)`

### **Download the .zip from release**

After you download it, extract the email-verification-master folder somewhere

<br>

### Now you can just start the `Start the server.bat`

This will navigate you through settings needed for the app
After the setup is done it will automatically start the server :)

<br>

## **Run Locally using git:**

Clone the project

```bash
  git clone https://github.com/esteban-cz/email-verification.git
```

Go to the project directory

```bash
  cd email-verification
```

Install dependencies

```bash
  npm install
```

<br>

### **Set Environment Variables**

To run this project, you will need to configure environment variables in your .env file

`/src/.env`

<br>

Start the server

```bash
  node src/server.js
```

<br>

## Authors

- [@esteban-cz](https://www.github.com/esteban-cz)
