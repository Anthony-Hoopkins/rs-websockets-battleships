import { WebSocket } from 'ws';

export type CustomWSocket = WebSocket & idType;

type idType = {
  id: string,
}
