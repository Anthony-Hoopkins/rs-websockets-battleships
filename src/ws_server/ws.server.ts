import { MessageTypes } from '../core/consts/enums/message-types';
import { UserService } from '../services/user.service';
import { ResponseUser, UserDto } from '../services/dto/user.dto';
import { RoomService } from '../services/room.service';
import { GameService } from '../services/game.service';
import { WebSocket, WebSocketServer } from 'ws';
import { WinnerService } from '../services/winner.service';
import { respRoomDto } from '../services/dto/room.dto';
import { AddShipsDto } from '../services/dto/game.dto';

let CURRENT_USER: UserDto;
let wsServer: WebSocketServer;

export function startWS() {
  const WS_PORT = 3000;

  wsServer = new WebSocketServer({ port: WS_PORT });
  // wsServer = new WebSocketServer(server);

  wsServer.on('connection', onConnect);

  console.log(`Start WS server on the ${WS_PORT} port!`);
}

export function onConnect(wsClient: WebSocket) {
  console.log('New connection...');
  // connectionHandler(wsClient, )

  wsClient.on('message', (message: any) => {
    wsMessageHandler(message, wsClient);
  });

  wsClient.on('close', () => {
    console.log(`User ${CURRENT_USER?.name} is disconnected!`);
  });
}

function getCompetitorIdFromGame(index: number, startedGameData: string) {

}

function wsMessageHandler(message: any, wsClient: WebSocket) {

  try {
    const parsedMessage = JSON.parse(message);

    console.log(parsedMessage);

    const userService = new UserService();
    const roomService = new RoomService();
    const gameService = new GameService();
    const winnerService = new WinnerService();


    switch (parsedMessage.type) {
      case MessageTypes.Registration: {
        const result = userService.registrationOrLogin(JSON.parse(parsedMessage.data));
        const user = result.error ? undefined : (result as ResponseUser);

        if (user) {
          CURRENT_USER = user;
        }

        connectionHandler(wsClient, user.index);

        sendMessage(MessageTypes.Registration, result, wsClient);

        const winners = winnerService.getWinnersList();
        messageToAll(MessageTypes.UpdateWinners, winners);

        const rooms = roomService.getAllNotFullRooms();
        sendMessage(MessageTypes.UpdateRoom, rooms, wsClient);

        break;
      }

      case MessageTypes.CreateRoom: {
        const result = roomService.createNewRoom(CURRENT_USER);
        sendMessage(MessageTypes.CreateRoom, result, wsClient);

        const rooms = roomService.getAllNotFullRooms();
        messageToAll(MessageTypes.UpdateRoom, rooms);

        break;
      }

      case MessageTypes.AddUserToRoom: {
        const result: any = roomService.addUserToRoom(CURRENT_USER, JSON.parse(parsedMessage.data));

        if (!result.error) {
          const newGame = gameService.createNewGame(CURRENT_USER.index);
          sendMessage(MessageTypes.CreateGame, newGame, wsClient);

          const id = getCompetitorIdFromRoom(CURRENT_USER.index, result);
          newGame.idPlayer = id;
          sendMessageByConnectId(MessageTypes.CreateGame, newGame, id);
        }

        const rooms = roomService.getAllNotFullRooms();
        messageToAll(MessageTypes.UpdateRoom, rooms);

        break;
      }

      case MessageTypes.AddShips: {
        const data: AddShipsDto = JSON.parse(parsedMessage.data);
        const isReadyToGame = gameService.addShipsToGame(data);

        if (isReadyToGame) {
          const currentId: number = data.indexPlayer;
          const startedGameData = gameService.startNewGame(data.gameId);

          const currentShipsData = {
            ships: startedGameData.playerShips.find((pShip: any) => pShip.indexPlayer === currentId),
            currentPlayerIndex: currentId,
          };

          sendMessage(MessageTypes.StartGame, currentShipsData, wsClient);
          // console.log(currentId);
          // console.log(currentShipsData);

          const anotherShips = startedGameData.playerShips.find((pShip: any) => pShip.indexPlayer !== currentId);

          const anotherShipsData = {
            ships: anotherShips,
            currentPlayerIndex: anotherShips.indexPlayer,
          };
          console.log(anotherShipsData);

          sendMessageByConnectId(MessageTypes.StartGame, anotherShipsData, anotherShips.indexPlayer);
          gameService.setTurnToGame(data.gameId, currentId);
          sendMessageByConnectId(MessageTypes.Turn, { currentPlayer: currentId }, currentId);
        }

        break;
      }

      case MessageTypes.Attack: {
        attackAction(false);

        break;
      }

      case MessageTypes.RandomAttack: {
        attackAction(true);

        break;
      }
      default:
        console.log('Unknown Type!');
        sendMessage(null, { error: true, errorText: 'Unknown Message Type!' }, wsClient);

        break;
    }

    function attackAction(isRandom: boolean): void {
      const attack = JSON.parse(parsedMessage.data);
      const game = gameService.getGameById(attack.gameId);

      if (game.turnId !== attack.indexPlayer) {
        console.log('Incorrect turn!');
        return;
      }

      const attackResult = gameService.attack(attack, isRandom);
      sendMessageByConnectId(MessageTypes.Attack, attackResult, attack.indexPlayer);

      console.log('attack.indexPlayer:');
      console.log(attack.indexPlayer);

      const otherId = gameService.getOtherPlayerIdFromAttackDto(attack);
      console.log('otherId:');
      console.log(otherId);

      sendMessageByConnectId(MessageTypes.Turn, { currentPlayer: game.turnId }, attack.indexPlayer);
      sendMessageByConnectId(MessageTypes.Turn, { currentPlayer: game.turnId }, otherId);
    }
  } catch (error) {
    console.log('Error', error);
  }
}

const connectionHandler = (ws: any, id: any) => {
  ws.id = id;
};

const messageToAll = (type: MessageTypes, msg: any) => {
  wsServer.clients.forEach((client: any) => {
    client.send(JSON.stringify({ type, data: JSON.stringify(msg), id: 0 }));

    console.log(messageToAll);
    console.log(client.id);
  });
};

const sendMessageByConnectId = (type: MessageTypes, msg: any, id: number) => {
  wsServer.clients.forEach((client: any) => {
    console.log(client.id);

    if (client.id === id) {
      console.log('messageToAnother:');
      console.log(id);
      client.send(JSON.stringify({ type, data: JSON.stringify(msg), id: 0 }));
    }
  });
};

const sendMessage = (type: MessageTypes, data: any, ws: WebSocket): void => {
  ws.send(JSON.stringify({ type, data: JSON.stringify(data), id: 0 }));
};

function getCompetitorIdFromRoom(currentIndex: number, room: respRoomDto): number {
  return room.roomUsers.find((user: UserDto) => user.index !== currentIndex)?.index;
}
