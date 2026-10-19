const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const jwt = require('jsonwebtoken');
const INTERCOM_API_SECRET = 'txG1lNFauOdHz9kNFbM9TIEdznSdUB4u0Q7VAHW2gXc';

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const INTERCOM_USER_ID = 'CUST001';
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8'
  });
  response.end(JSON.stringify(body));
}

const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET' });
    response.end('Method not allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }

  if (pathname === '/intercom-token') {
    if (!INTERCOM_API_SECRET) {
      sendJson(response, 503, { error: 'Intercom identity secret is not configured' });
      return;
    }

    const token = jwt.sign({ user_id: INTERCOM_USER_ID }, INTERCOM_API_SECRET, { expiresIn: '1h' });
    sendJson(response, 200, { user_id: INTERCOM_USER_ID, token });
    return;
  }

  const relativePath = pathname === '/' ? 'page-1-home.html' : pathname.slice(1);
  const filePath = path.resolve(root, relativePath);
  const relativeToRoot = path.relative(root, filePath);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot) || relativeToRoot.startsWith('node_modules')) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  try {
    const stats = await fs.promises.stat(filePath);
    if (!stats.isFile()) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream'
    });
    fs.createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Navy Pier site listening at http://localhost:${port}`);
});