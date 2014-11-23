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
	fs = require('fs'),
	exec = require('child_process').exec,
	express = require('express'),
	morgan = require('morgan'),
	favicon = require('serve-favicon'),
	bodyParser = require('body-parser'),
	multer = require('multer'),
	git = require('nodegit');

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

app.post('/build', function(req, res) {
	console.log('Building ' + req.param('user') + '/' + req.param('repo'));
	var localPath = path.join(__dirname, 'build', req.param('user'), req.param('repo'));
	var githubPath = 'git://github.com/' + req.param('user') + '/' + req.param('repo') + '.git';
	git.Clone.clone(githubPath, localPath).then(function(repo) {
		var buildPath = path.join(__dirname, 'build', req.param('user'), req.param('repo'));
		var buildScript = 'cd ' + buildPath + '; git submodule init; git submodule update; chmod +x ./gradlew; ./gradlew clean setupCIWorkSpace build;';
		res.end();
		var child = exec(buildScript, function(err, stdout, stderr) {
			if (err == null) {
				console.log('Yay! Build finished!');
			}
		});
	});
});



// Start web server
console.log('Continue starting on port ' + app.get('port'));
app.listen(app.get('port'));