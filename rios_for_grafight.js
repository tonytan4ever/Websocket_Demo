var app = require('http').createServer(handler);

const io = require('socket.io').listen(app);
const redis = require("redis");

app.listen(8001);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

console.log("Creating redis client...")


console.log('Grafight rios start listening...');

io.sockets.on('connection', function (socket) {
	var client = redis.createClient();
	
	socket.on('subscribe_to_metric', function(metric_pattern){
		  console.log('Got metric: %s', metric_pattern.toString());
		  // start subcribe to redis channels.
		  console.log('subscribe to metric: %s', metric_pattern.toString());
		  client.subscribe(metric_pattern);
		  client.on("message", function(channel, message){
    		  console.log(channel + ":" + message);
    		  if(channel == metric_pattern) 
    		  	socket.emit(metric_pattern, message.toString());
    	  });
		  
	});
});
