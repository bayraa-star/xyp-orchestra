const cluster = require('cluster');
const os = require('os');
require('dotenv').config();
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers for maximum CPU usage
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const app = require('../invoker');
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Worker ${process.pid} started on port ${port}`);
  });
}