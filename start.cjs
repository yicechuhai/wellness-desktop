const { spawn, exec } = require('child_process');
const path = require('path');
const http = require('http');

const PORT = 3001;
const MAX_WAIT = 60; // seconds

console.log('==========================================');
console.log('  养生馆经营跟进系统正在启动...');
console.log('==========================================');

// Start backend
const serverPath = path.join(__dirname, 'backend', 'server.cjs');
const backend = spawn(process.execPath, [serverPath], {
  cwd: __dirname,
  stdio: 'pipe',
});

backend.stdout.on('data', (d) => {
  const line = d.toString().trim();
  if (line) console.log('[Backend]', line);
});

backend.stderr.on('data', (d) => {
  const line = d.toString().trim();
  if (line) console.log('[Backend]', line);
});

// Wait for server to be ready
let waited = 0;
const checkInterval = setInterval(() => {
  waited++;
  const req = http.get(`http://127.0.0.1:${PORT}/api/dashboard`, (res) => {
    if (res.statusCode === 200) {
      clearInterval(checkInterval);
      console.log('\n==========================================');
      console.log('  服务已启动！正在打开浏览器...');
      console.log(`  访问地址: http://localhost:${PORT}`);
      console.log('==========================================\n');

      // Open browser
      const platform = process.platform;
      let cmd;
      if (platform === 'win32') {
        cmd = `start http://localhost:${PORT}`;
      } else if (platform === 'darwin') {
        cmd = `open http://localhost:${PORT}`;
      } else {
        cmd = `xdg-open http://localhost:${PORT}`;
      }
      exec(cmd, (err) => {
        if (err) console.log('请手动打开浏览器访问: http://localhost:' + PORT);
      });
    }
  }).on('error', () => {
    // Server not ready yet
  });

  req.setTimeout(1000, () => req.destroy());

  if (waited > MAX_WAIT) {
    clearInterval(checkInterval);
    console.log('服务启动超时，请检查日志');
    process.exit(1);
  }
}, 1000);

// Handle exit
process.on('SIGINT', () => {
  console.log('\n正在关闭服务...');
  backend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill();
  process.exit(0);
});
