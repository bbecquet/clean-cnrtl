const express = require('express')
const cookieParser = require('cookie-parser')

const app = express()
app.use(cookieParser())
app.set('view engine', 'hbs')
app.set('views', __dirname + '/templates')

app.use(function (req, _res, next) {
  console.log(new Date().toISOString(), req.originalUrl)
  next()
})

const defs = require('./defRoutes')

app.use('/def', defs)
app.use(express.static(__dirname))

// Handle 404
app.use(function (req, res) {
  res.status(404)
  res.send('Not found')
})

const port = process.env.PORT || 3666
app.listen(port)
console.log('-----\nSite served on http://localhost:' + port + '\n-----')
