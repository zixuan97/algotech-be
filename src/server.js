require('dotenv').config();
const { Client } = require('pg');
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

const userRouter = require('./routes/user');

const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

const client = new Client({
  user: process.env.RDS_USERNAME,
  host: process.env.RDS_HOSTNAME,
  database: 'postgres',
  password: process.env.RDS_PASSWORD,
  port: 5432
});

client.connect(function (err) {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

app.use('/users', userRouter);
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('200 OK');
});

app.listen(port, () => {
  console.log('Server running on port ' + port);
});

module.exports = app;
