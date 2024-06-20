const redis = require('redis');

const readFromRedis = async (key) => {

  let redisClient = redis.createClient({
    url:  'redis://default:bLsP5AIXiORBzQpvrCCdqNlPysKyuJfvLN7SdPMtBrkPaLfkJE7Wi2LAXgZSgpORdvEAdw5bi7BTBy5@redis-qa.conciergeforplatinum.com:6379/2'
  })

  redisClient.on('error', function (err) {
    console.log('No se puede conectar con redis' + err);
  });

  redisClient.on('connect', function (err) {
    console.log('Conexión para lectura exitosa en redis');
  });

  await redisClient.connect();

  const value = await redisClient.get(key);
  
  await redisClient.disconnect();

  return value
}

module.exports = readFromRedis