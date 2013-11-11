import redis,time,math
import simplejson as json

def produce_forever():
    r_server = redis.Redis("localhost")
    while True: 
        x = time.time() 
        y = 2.5 * (1 + math.sin(x / 50))
        print "publish to channel metricA..." 
        r_server.publish("metricA", json.dumps(dict(x=x, y=y)))
        print "publish to channel metricB..." 
        r_server.publish("metricB", json.dumps(dict(x=x, y=2*y)))
        time.sleep(1)
        

if __name__ == "__main__":
    produce_forever()
    

