import redis,time,math,zmq
import simplejson as json

def produce_forever():
    context = zmq.Context()
    socket = context.socket(zmq.PUB)
    socket.bind("tcp://127.0.0.1:5000")
    limits = 50
    while True: 
        x = time.time()*1000 
        y = 2.5 * (1 + math.sin(x / 500))
        for i in xrange(0,limits):
            print "publish to ", "".join(["metric", str(i+1)]) 
            msg = "".join(["metric", str(i+1)]) +" "+ json.dumps(dict(x=x, y=(i+1)*y))
            print "->",msg
            socket.send( msg )
        time.sleep(5)
        

if __name__ == "__main__":
    produce_forever()