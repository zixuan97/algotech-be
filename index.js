const express = require('express');
const app = express();
const path = require('path');

app.use(express.static('public'));
app.use(express.json());
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});

app.use('/user', require('./public/routes/userRoutes'));

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
