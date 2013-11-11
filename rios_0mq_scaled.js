var app = require('express').createServer(); 

var io = require('socket.io').listen(app),
	  zmq = require('zmq'),
	  sock = zmq.socket('sub');

sock.connect('tcp://127.0.0.1:5000');

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
				    	  sock.subscribe(metric_patterns)
				    	  sock.on('message', function(msg){
				    		  console.log('Got Data: %s', msg.toString());
				    		  socket.emit('data', msg.toString());
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
				    		  sock.subscribe(metric_pattern)
				    	  })
				    	  sock.on('message', function(msg){
				    		  console.log('Got Data: %s', msg.toString());
				    		  socket.emit('data', msg.toString());
				    	  });
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