var app = require('express').createServer(); 

const io = require('socket.io').listen(app);
const redis = require("redis"),
 client = redis.createClient();

app.listen(80);

app.all('/:dashboard_id/:metric_patterns', function (req, res, next) {
	var metric_patterns = JSON.parse(req.params.metric_patterns);
	console.log(metric_patterns);
	if((typeof metric_patterns) == "string") {
		  /* Only one metric pattern has been subscribed */
		  io.sockets.on('connection', function (socket) {
			  socket.on('set nickname', function (name) {
			    socket.set('nickname', name, function () {
			      socket.emit('ready');
			      console.log('waiting client\'s acknowledgement...');
			    });
			  });

			  socket.on('start forwarding data (to client)...', function () {
			    socket.get('nickname', function (err, name) {
			    	  console.log("nick nickname: " + name)
				      if(name == req.params.dashboard_id) {
				    	  console.log("building subscription to " + metric_patterns);
				    	  client.subscribe(metric_patterns);
				    	  client.on("message", function(channel, message){
				    		  console.log(channel + ": " + message);
				    		  if(channel == metric_patterns) 
				    		  	socket.emit(metric_patterns, message.toString());
				    	  });
				      }
			    });
			  });
		  });
		  		  
		  res.header("Access-Control-Allow-Origin", "*");
		  res.header("Access-Control-Allow-Headers", "X-Requested-With");
		  res.send("Subscribe to valid metric name" + req.params.metric_pattern );
		  
		  
	} else if (metric_patterns instanceof Array) {
		  /* Only multiple metric patterns. Loop through the list and build subscription */
		  io.sockets.on('connection', function (socket) {
			  socket.on('set nickname', function (name) {
			    socket.set('nickname', name, function () {
			      socket.emit('ready');
			      console.log('waiting client\'s acknowledgement...');
			    });
			  });

			  socket.on('start forwarding data (to client)...', function () {
			    socket.get('nickname', function (err, name) {
			    	  console.log("nick nickname: " + name)
				      if(name == req.params.dashboard_id) {
				    	  metric_patterns.forEach(function(metric_pattern){ 
					    	  console.log("building subscription to " + metric_pattern);
					    	  client.subscribe(metric_pattern);
					    	  var last_timestamp  =  -1;
					    	  client.on("message", function(channel, message){
					    		  console.log(channel + ": " + message);
					    		  if(channel == metric_pattern){
					    		  	socket.emit(metric_pattern, message.toString());
					    		  	console.log("message emitted!");
					    		  }
					    	  });
				    	  })
				      }
			    });
			  });
		  });
		  		  
		  res.header("Access-Control-Allow-Origin", "*");
		  res.header("Access-Control-Allow-Headers", "X-Requested-With");
		  res.send("Subscribe to valid metric name/list: " + req.params.metric_patterns );  
		
	} else {
	  next(new Error('Invalid metric pattern ' + req.params.metric_patterns));
	}
  
});