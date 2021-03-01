const express = require('express');
const { getDef, getCnrtlURL } = require('./src/cnrtl-util');

const app = express();
app.set('view engine', 'hbs');
app.set('views', __dirname + '/templates');

app.use(function (req, _res, next) {
  console.log(new Date().toISOString(), req.originalUrl);
  next();
});

app.get('/def/:word', function (req, res, next) {
  const word = req.params.word;
  getDef(word)
    .then(body => {
      res.render('def', {
        def: body,
        word,
        cnrtlLink: getCnrtlURL(word),
      });
    })
    .catch(error => {
      console.error(error);
      next();
    });
});

app.get('/search', function (req, res, next) {
  const word = req.query['word'];
  res.redirect(`/def/${word}`);
});

app.use(express.static(__dirname));

// Handle 404
app.use(function (req, res) {
  res.status(404);
  res.send('Not found');
});

const port = process.env.PORT || 3666;
app.listen(port);
console.log('-----\nSite served on http://localhost:' + port + '\n-----');
