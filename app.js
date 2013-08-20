var http = require('http'),
	
	__PORT__ = 3100,

	router = require('router'),
	route = router(),

	url = require('url'),

	fs = require('fs'),
	dir = './data/',
	poiData = {},

	indexHtml = '';

var unproject = function (z, x, y) {
	var d = 57.29577951308232,
		scale = 256 * (1 << z),
		_a = 0.5 / Math.PI,
		_b = 0.5,
		_c = -0.5 / Math.PI,
		_d = 0.5,
		wx = (x / scale - _b) / _a,
		wy = (y / scale - _d) / _c,

	    lng = wx * d,
	    lat = (2 * Math.atan(Math.exp(wy)) - (Math.PI / 2)) * d;

	return {
		lat : lat,
		lng : lng
	};
};

var getTilePoi = function(z, x, y){
	var response = {
			response: {
				code: 200
    		},
    		result: {
    			poi : []
			}
		},

		w_c_x = x * 256 + 128,
		w_c_y = y * 256 + 128,
		d = 40,
		
		nw = unproject(z, w_c_x - d, w_c_y - d),
		ne = unproject(z, w_c_x + d, w_c_y - d),
		sw = unproject(z, w_c_x - d, w_c_y + d),
		se = unproject(z, w_c_x + d, w_c_y + d),
		randomPoi = poiData[z][Math.floor(Math.random() * poiData[z].length)];

	randomPoi.hover = [
		'POLYGON((', 
			nw.lng, ' ', nw.lat,
			',',
			ne.lng, ' ', ne.lat,
			',',
			se.lng, ' ', se.lat, 
			',', 
			sw.lng, ' ', sw.lat,
			',',
			nw.lng, ' ', nw.lat,
		'))'].join('');

	response.result.poi.push(randomPoi);

	return JSON.stringify( response );
};

var prepareData = function(callback){
	fs.readFile('./index.html', function (err, html) {
	    if (err) {
	        throw err; 
	    }       
	    indexHtml = html;
	});
	fs.readdir(dir, function(err, files){
		if (err) throw err;
	    files.forEach(function(file){
	        fs.readFile(dir + file, 'utf-8', function(err, json){
	            if (err) throw err;
	            poiData[parseInt(file, 10)] = JSON.parse(json)['poi'];
			});
	    });
	    callback();
	});
};

var startServer = function(){
	route.get('/{z}/{x}/{y}', function(req, res) {
		var queryData = url.parse(req.url, true).query,
			zoom = parseInt(req.params.z, 10),
			tileX = parseInt(req.params.x, 10),
			tileY = parseInt(req.params.y, 10),

			response;

		if (isNaN(zoom) || isNaN(tileX) || isNaN(tileY)) {
			response = JSON.stringify({
				response : { 	 	 
			 	 	code : 500,
			 	 	message	: 'isNaN(z) || isNaN(x) || isNaN(y)'
				},
				result : {}	
			});
		} else if ( typeof(poiData[zoom]) === 'undefined' ) {
			response = JSON.stringify({
				response : { 	 	 
			 	 	code : 500,
			 	 	message	: 'no data for this zoom level'
				},
				result : {}	
			});
		} else {
			response = getTilePoi(zoom, tileX, tileY);
		}

		if (queryData.callback) {
			res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf8'});
			res.end( [queryData.callback, '(', response, ')'].join('') );
		} else {
			res.writeHead(200, {'Content-Type': 'application/json; charset=utf8'});
			res.end( response );
		}
	});

	route.get('/', function(req, res) {
		res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
		res.write(indexHtml);
		res.end();
	});

	route.get(function(req, res) {
		res.writeHead(404);
		res.end('something went wrong');
	});

	http.createServer(route).listen(__PORT__);
};

prepareData(function(){
	startServer();
	console.log('POI mockup server running at http://127.0.0.1:'+__PORT__+'/');
});