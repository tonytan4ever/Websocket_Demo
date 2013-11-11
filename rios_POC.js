var app = require('express').createServer(); 

const io = require('socket.io').listen(app);
const redis = require("redis"),
 client = redis.createClient();

app.listen(80);

app.all('/:dashboard_id/:metric_pattern', function (req, res, next) {
  if(req.params.metric_pattern ==  "metricA" || req.params.metric_pattern ==  "metricB"){
	  /*subscribe to corresponding channel in redis*/
	  io.sockets.on('connection', function (socket) {
		  socket.on('set nickname', function (name) {
		    socket.set('nickname', name, function () {
		      socket.emit('ready');
		      console.log('waiting client\'s acknowledgement...');
		    });
		  });

		  socket.on('start receiving data (from client)...', function () {
		    socket.get('nickname', function (err, name) {
		    	  console.log("nick nickname: " + name)
			      if(name == req.params.dashboard_id) {
			    	  console.log("building subscription to " + req.params.metric_pattern);
			    	  client.subscribe(req.params.metric_pattern);
			    	  client.on("message", function(channel, message){
			    		  console.log(channel + ": " + message);
			    		  if(channel == req.params.metric_pattern) 
			    		  	socket.emit(req.params.metric_pattern, message.toString());
			    	  });
			      }
		    });
		  });
	  });
	  
	  
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "X-Requested-With");
	  res.send("Subscribe to valid metric name" + req.params.metric_pattern );
  }
  else {
	  next(new Error('Invalid metric pattern ' + req.params.metric_pattern));
  }
  
});