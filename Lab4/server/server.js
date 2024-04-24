const express = require('express');
const cors = require('cors');
const path = require('path');
const port = 3000;
const app = express();

// routers
const news = require('./routes/news');
const forex = require('./routes/forex');
const weather = require('./routes/weather');
const details = require('./routes/details');
const all_details = require('./routes/all_details');

app.use(express.static(path.join(__dirname, '../news-ticker/build')));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //parses stuff passed into request body
app.use(cors({ origin: '*' })); //allow requesters to use response in code

// routes
app.use('/news', news);
app.use('/forex', forex);
app.use('/weather', weather);
app.use('/details', details);
app.use('/all_details', all_details);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
  console.log('http://localhost:' + port);
});