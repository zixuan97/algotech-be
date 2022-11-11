const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { verifyToken, whiteListInternal } = require('./public/middleware/auth');

const corsWhitelist = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://algotech-fe.vercel.app',
  'https://algotech-fe-prod.vercel.app',
  'https://algotech-fe-b2b.vercel.app',
  'https://algotech-fe-hrm.vercel.app'
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (corsWhitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        //log.out('Domain not allowed by CORS', origin); // replace to fix logging spam
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

// internal algotech-fe
app.use('/user', require('./public/routes/userRoutes'));
app.use(
  '/category',
  whiteListInternal,
  require('./public/routes/categoryRoutes')
);
app.use(
  '/product',
  whiteListInternal,
  require('./public/routes/productRoutes')
);
app.use('/brand', whiteListInternal, require('./public/routes/brandRoutes'));
app.use(
  '/location',
  whiteListInternal,
  require('./public/routes/locationRoutes')
);
app.use(
  '/supplier',
  whiteListInternal,
  require('./public/routes/supplierRoutes')
);
app.use(
  '/procurement',
  whiteListInternal,
  require('./public/routes/procurementRoutes')
);
app.use('/bundle', whiteListInternal, require('./public/routes/bundleRoutes'));
app.use('/shopee', whiteListInternal, require('./public/routes/shopeeRoutes'));
app.use('/lazada', whiteListInternal, require('./public/routes/lazadaRoutes'));
app.use(
  '/delivery',
  whiteListInternal,
  require('./public/routes/deliveryRoutes')
);
app.use(
  '/shopify',
  whiteListInternal,
  require('./public/routes/shopifyRoutes')
);
app.use('/sales', whiteListInternal, require('./public/routes/salesRoutes'));
app.use(
  '/newsletter',
  whiteListInternal,
  require('./public/routes/newsletterRoutes')
);
app.use('/customer', require('./public/routes/customerRoutes'));
app.use('/discountCode', require('./public/routes/discountCodeRoutes'));

//external algotech-fe-b2b
app.use('/productCatalogue', require('./public/routes/productCatalogueRoutes'));
app.use('/bundleCatalogue', require('./public/routes/bundleCatalogueRoutes'));
app.use('/bulkOrder', require('./public/routes/bulkOrderRoutes'));
app.use('/payment', require('./public/routes/paymentRoutes'));

//internal algotech-fe-hrm
app.use('/step', require('./public/routes/stepRoutes'));
app.use('/topic', require('./public/routes/topicRoutes'));
app.use('/subject', require('./public/routes/subjectRoutes'));
app.use('/quiz', require('./public/routes/quizRoutes'));
app.use('/quizquestion', require('./public/routes/quizQuestionRoutes'));
app.use('/leave', require('./public/routes/leaveRoutes'));

const port = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
