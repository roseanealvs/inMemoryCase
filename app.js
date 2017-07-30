const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

let client = redis.createClient();
client.on('connect', function() {
  console.log('Connected to Redis.');
});
const port = 3000;
const app = express();
app.engine('handlebars', exphbs({defaultLayout : 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(methodOverride('_method'));

app.get('/', function(req, res, next) {
  res.render('searchdata');
});

app.post('/people/search', function(req, res, next){
  let nameSearch = req.body.name;
  var rangeByLex = ["name", "["+nameSearch, "("+nameSearch+"\xff", "LIMIT", "0", "2"];
  client.hgetall(nameSearch, function(err, obj) {
    if (!obj){
      res.render('searchdata', {
        error: 'Nothing was found :/'
      });
    } else {
      obj.name = nameSearch;
      res.render('details', {
        person: obj
      });
    }
  });
});

app.listen(port, function() {
  console.log('Server started on port: ' + port);
});
