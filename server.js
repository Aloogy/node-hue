
var app = require('express')(); //We tell express (a webserver module to use itself and create the "app" variable, we'll run everything through this.
var http = require('http').Server(app); //Finally we need a http parser that uses "app"
var io = require('socket.io')(http); //We'll need socket.io later 
var express = require('express');
var requestify = require('requestify'); 

var port = 80;
var hueBridgeIP = '192.168.1.73';
var hueApiToken = 'mtvDX81q3o9Hmp9BOabI-zvzs9KmO2hjOXjY1rcn';

var apiUrl = 'http://'+hueBridgeIP+'/api/'+hueApiToken+'/';

//---------------- WORKING CODE START -------------- 
	
	// ------- REUSABLE FUNCTIONS START -------
	
	function getAllLights(callback){
		requestify.get(apiUrl+'lights').then(function(response) {
		    callback(response.getBody());
		});
	}
	function getLight(light_id, callback){
		requestify.get(apiUrl+'lights/'+light_id).then(function(response) {
		    callback(response.getBody());
		});			
	}
	function toggleLight(light_id, state, callback){
	
		requestify.request(apiUrl+'lights/'+light_id+'/state', {
			method: 'PUT',
			body: {
				on: state
			},
			dataType: 'json'
		}).then(function(response) {
		    callback(response.getBody());
		});				
	    	
	}
	
	// ------- REUSABLE FUNCTIONS END -------
	
	
	// ------- EXPRESS ROUTING START -------	
	app.use('/assets', express.static('assets')); //lets tell express that theres a static directory
	
	app.get('/', function(req, res, next) { //if a client requests such URL as / then...
		res.sendFile(__dirname +'/app/pages/home.html'); //send this file
		console.log("[INFO] User request home page!");
	});
	
	app.get('/about', function(req, res, next) { //if a client requests such URL as / then...
		res.sendFile(__dirname +'/app/pages/about.html'); //send this file
		console.log("[INFO] User request about page!");
	});
	
	app.get('/app/app.js', function(req, res, next) {
			res.sendFile(__dirname +'/app/app.js');	
	});	
	
	app.get('*', function(req, res, next) { //if a client requests such URL as / then...
		res.sendFile(__dirname +'/app/pages/404.html'); //send this file
		console.log("[ERROR] Page not found: "+req.url);
	});
	//----- EXPRESS ROUTING END ------
	
	
	
	
	
	
	//------ SOCKET.IO START -------
	io.on('connection', function(socket){ //waiting for socket connection, on connection, get socket
		console.log("[INFO] A user connected to socket.io!");
		
		
		socket.on('getAllLights', function(){
			getAllLights(function(response){
				socket.emit('getAllLights-feedback', {lights: response});
			});
		}); 
		
		socket.on('getLight', function(msg){
			getLight(msg.light_id, function(response){
				socket.emit('getLights-feedback', {light: response});
			});
		});
		
		socket.on('changeLightState', function(msg){
			toggleLight(msg.light_id, msg.state, function(responce){
				//once complete, send update
				socket.emit('update-lights');
			});
		});	
		
		socket.on('toggleAllLights', function(msg){
			//get all the lights
			//for each light, toggle on/off
			//once complete, send update
		});							
		
		
	});		
	
	
	//------ SOCKET.IO END -------






//---------------- WORKING CODE END -------------- 

http.listen(port, function(){ //use the http server to listen from our port for request
	console.log("[INFO] HTTP & Socket Server started on port "+port+"!");
});	
