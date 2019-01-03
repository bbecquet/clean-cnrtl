const express = require('express');
const hbs = require('hbs');
const { getDef } = require('./cnrtl-util');

const app = express();
app.set('view engine', 'hbs');
app.set('views', __dirname + '/templates');

app.use(function(req, res, next) {
    console.log(new Date().toISOString(), req.originalUrl);
    next();
});

app.get('/def/:word', function(req, res, next) {
    const word = req.params.word;
    getDef(word)
        .then(body => {
            res.render('def', {
                def: body,
                word,
            });
        })
        .catch(() => { next(); })
});

app.use(express.static(__dirname));

// Handle 404
app.use(function(req, res) {
    res.status(404);
    res.send('Not found');
});

const port = process.env.PORT || 3666;
app.listen(port);
console.log('-----\nSite served on http://localhost:' + port + '\n-----');
