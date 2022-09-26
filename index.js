const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const corsWhitelist = [
  'http://localhost:3000',
  'https://algotech-fe.vercel.app',
  'https://algotech-fe-prod.vercel.app',
  'https://www.legendkong.com'
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (corsWhitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // log('out', 'Domain not allowed by CORS', origin) // replace to fix logging spam
        callback(null);
      }
    },
    credentials: true
  })
);

app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});

app.use('/user', require('./public/routes/userRoutes'));
app.use('/category', require('./public/routes/categoryRoutes'));
app.use('/product', require('./public/routes/productRoutes'));
app.use('/brand', require('./public/routes/brandRoutes'));
app.use('/location', require('./public/routes/locationRoutes'));
app.use('/supplier', require('./public/routes/supplierRoutes'));
app.use('/procurement', require('./public/routes/procurementRoutes'));
app.use('/bundle', require('./public/routes/bundleRoutes'));
app.use('/shopee', require('./public/routes/shopeeRoutes'));
app.use('/lazada', require('./public/routes/lazadaRoutes'));
app.use('/delivery', require('./public/routes/deliveryRoutes'));
app.use('/shopify', require('./public/routes/shopifyRoutes'));
app.use('/sales', require('./public/routes/salesRoutes'));

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
