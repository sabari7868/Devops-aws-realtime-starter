const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Redis = require('ioredis');
const client = new Redis({ host: process.env.REDIS_HOST || 'redis' });
const sub = new Redis({ host: process.env.REDIS_HOST || 'redis' });
const promClient = require('prom-client');

const websocketGauge = new promClient.Gauge({ name: 'websocket_connections', help: 'Active websocket connections' });

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let activeConnections = 0;

wss.on('connection', (ws) => {
  activeConnections++;
  websocketGauge.set(activeConnections);

  ws.on('message', (message) => {
    // publish to redis so all pods will receive
    client.publish('chat', message);
  });

  ws.on('close', () => {
    activeConnections--;
    websocketGauge.set(activeConnections);
  });
});

sub.subscribe('chat', (err) => {
  if (err) console.error('sub subscribe err', err);
});
sub.on('message', (channel, message) => {
  // broadcast to all connected sockets
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(message);
  });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log('Chat server listening on', PORT));
