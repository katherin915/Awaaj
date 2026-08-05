const cluster = require("cluster");
const os = require("os");
const process = require("process");

const app = require("./app");

const numCPUs = os.cpus().length;
if (cluster.isPrimary) {
  console.log(`======================================`);
  console.log(`Awaaz Backend Primary Process Started`);
  console.log(`Primary PID:${process.pid}`);
  console.log(`=======================================`);
  console.log(`Forking server for ${numCPUs} CPU Cores...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("online", (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Worker ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`
    );
    if (worker.exitedAfterDisconnect === true) {
      console.log(
        `Worker ${worker.process.pid} exited shutting down gracefully.`
      );
    } else {
      console.log(
        `Worker ${worker.process.pid} exited unexpectedly. Restarting...`
      );
      cluster.fork();
    }
  });
} else {
  // === Start Server ===
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
