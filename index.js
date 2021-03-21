const express = require('express')
const cookieParser = require('cookie-parser')

const app = express()
app.use(cookieParser())

app.use(function (req, _res, next) {
  console.log(new Date().toISOString(), req.originalUrl)
  next()
})

const definitionApp = require('./defApp')
const defPath = '/'
app.use(defPath, definitionApp(defPath))

// Handle 404
app.use(function (req, res) {
  res.status(404)
  res.send('Not found')
})

const port = process.env.PORT || 3666
app.listen(port)
console.log('-----\nSite served on http://localhost:' + port + '\n-----')
