require('dotenv').config();
const { Client } = require('pg');
const express = require('express');
const cors = require('cors');
const app = express();
const { v4 } = require('uuid');

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

app.listen(port, () => {
  console.log('Server running on port ' + port);
});

app.get('/api', (req, res) => {
  const path = `/api/item/${v4()}`;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end(`Hello! Go to item: <a href="${path}">${path}</a>`);
});

module.exports = app;
