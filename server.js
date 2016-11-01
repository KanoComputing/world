const express = require('express');

let app = express();

app.use('/new', express.static(__dirname + '/www'));

app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile('index.html', { root: './www' }, err => err && next())
  } else next()
});

app.listen(7000, () => {
    console.log('app listenerinig');
});