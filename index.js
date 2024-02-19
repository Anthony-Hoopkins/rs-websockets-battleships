import { httpServer } from './src/http_server/index.js';
import { WebSocketServer } from 'ws';
import { onConnect } from './src/ws_server/ws.server.js';

const HTTP_PORT = 8181;
export const WS_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

export const wsServer = new WebSocketServer({ port: WS_PORT });

wsServer.on('connection', onConnect);

console.log(`Start WS server on the ${WS_PORT} port!`);

