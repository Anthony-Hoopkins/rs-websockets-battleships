import { httpServer } from './src/http_server';
import { startWS } from './src/ws_server/ws.server.js';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

startWS();
// startWS(httpServer);


