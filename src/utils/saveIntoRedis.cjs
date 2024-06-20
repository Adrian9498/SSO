const redis = require('redis');

const saveIntoRedis = async (key, value) => {

  let redisClient = redis.createClient({
    url:  'redis://default:bLsP5AIXiORBzQpvrCCdqNlPysKyuJfvLN7SdPMtBrkPaLfkJE7Wi2LAXgZSgpORdvEAdw5bi7BTBy5@redis-qa.conciergeforplatinum.com:6379/2'
  })

  redisClient.on('error', function (err) {
    console.log('No se puede conectar con redis' + err);
  });

  redisClient.on('connect', function (err) {
    console.log('Conexión para escritura exitosa en redis');
  });
  
  await redisClient.connect();
  
  await redisClient.setEx(key, 300 ,value);

  await redisClient.disconnect();
}

module.exports = saveIntoRedis;