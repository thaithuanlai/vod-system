const app    = require('./src/app');
const config = require('./src/config');


const server = app.listen(config.port, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║        VOD System — API Gateway        ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Status : Running                   ║`);
  console.log(`║  Port   : ${config.port}                          ║`);
  console.log(`║  Env    : ${config.nodeEnv.padEnd(10)}              ║`);
  console.log(`║  URL    : http://localhost:${config.port}          ║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');
});




const shutdown = (signal) => {
  console.log(`\n[Gateway] Nhận tín hiệu ${signal}, đang tắt server...`);
  server.close(() => {
    console.log('[Gateway] Server đã tắt sạch.');
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM')); 
process.on('SIGINT',  () => shutdown('SIGINT'));  


process.on('unhandledRejection', (reason) => {
  console.error('[Gateway] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Gateway] Uncaught Exception:', err);
  process.exit(1);
});