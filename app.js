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
	http = require('http'),
	express = require('express'),
	morgan = require('morgan'),
	favicon = require('serve-favicon'),
	bodyParser = require('body-parser'),
	multer = require('multer'),
	git = require('nodegit')
	socketio = require('socket.io');

// The App!
var app = express();
var server = http.Server(app);
var socket = socketio(server);

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
		// console.log(logPath);
		var buildScript = 'cd ' + buildPath + '; git submodule init; git submodule update; chmod +x ./gradlew; ./gradlew clean setupCIWorkSpace build;';
		// console.log('hello');
		res.render('building', { title: req.param('repo') + ' | Continue', repo: req.param('user') + '/' + req.param('repo') });
		var child = exec(buildScript, function(err, stdout, stderr) {
			if (!err) {
				console.log(req.param('user') + '/' + req.param('repo'), ' build finished: successful');
				// TODO: Archive build artifacts
				var log = path.join(__dirname, 'logs', req.param('user'), req.param('repo') + '.txt');
				fs.writeFile(log, stdout, function(err) {
					if (err) console.error(err);
				});

				socket.emit('log', { repo: req.param('user') + '/' + req.param('repo'), logs: stdout.toString() });

			} else {
				console.log(req.param('user') + '/' + req.param('repo'), ' build finished: failed');
				console.error(err);
			}
		});
	});
});



// Start web server
// console.log('Continue starting on port ' + app.get('port'));
// app.listen(app.get('port'));
server.listen(app.get('port'), function() {
	console.log('Continue starting on port ' + app.get('port'));
});