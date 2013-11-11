import redis,time,math
import simplejson as json

def produce_forever():
    r_server = redis.Redis("localhost")
    limits = 50
    while True: 
        x = time.time()*1000 
        y = 2.5 * (1 + math.sin(x / 500))
        for i in xrange(0,limits):
            print "publish to channel", "".join(["metric", str(i+1)]) 
            r_server.publish("".join(["metric", str(i+1)]), json.dumps(dict(x=x, y=(i+1)*y)))
        time.sleep(20)
        

if __name__ == "__main__":
    produce_forever()