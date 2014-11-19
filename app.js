/*	Continue:
*	A super-awesome continuous integration server
*	
*	Author: Shadowfacts 
*	
*	URL: http://github.com/shadowfacts/continue
*	
*	License: MIT
*/


// Modules
var path = require('path'),
	express = require('express'),
	morgan = require('morgan'),
	favicon = require('serve-favicon'),
	bodyParser = require('body-parser'),
	multer = require('multer');

// The App!
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: './uploads/' }));

app.set('port', process.env.PORT || 8080);

app.get('/', function(req, res) {
	res.render('index', { title: 'Continue | Super-Awesome Continuous Integration' });
});



// Start web server
console.log('Continue starting on port ' + app.get('port'));
app.listen(app.get('port'));