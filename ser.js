var express = require('express')
var path = require('path')
var app = express()

app.use(express.static('./dist'))


app.get('/', function (req, res) {
  res.sendFile( path.join(__dirname,  './dist/index_prod.html'))
})

app.listen(3000)