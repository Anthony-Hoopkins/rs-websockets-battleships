import { MessageTypes } from '../core/consts/enums/message-types';
import { UserService } from '../services/user.service';
import { ResponseUser, UserDto } from '../services/dto/user.dto';
import { RoomService } from '../services/room.service';
import { GameService } from '../services/game.service';
import { WebSocket, WebSocketServer } from 'ws';
import { WinnerService } from '../services/winner.service';
import { respRoomDto } from '../services/dto/room.dto';
import { AddShipsDto, AttackDto } from '../services/dto/game.dto';
import { CustomWSocket } from '../core/types/ws.type';

let wsServer: WebSocketServer;

const userService = new UserService();
const gameService = new GameService();
const roomService = new RoomService();
const winnerService = new WinnerService();

export function startWS() {
  const WS_PORT = 3000;

  wsServer = new WebSocketServer({ port: WS_PORT });
  // wsServer = new WebSocketServer(server);

  wsServer.on('connection', onConnect);

  console.log(`Start WS server on the ${WS_PORT} port!`);
}

export function onConnect(wsClient: CustomWSocket) {
  console.log('New connection...');

  wsClient.on('message', (message: any) => {
    wsMessageHandler(message, wsClient);
  });

  wsClient.on('close', () => {
    const id = wsClient.id;
    finishIfUserInGame(wsClient, id);

    userService.removeUserById(id);
    console.log(`User ${userService.getUserById(id)?.name} is disconnected!`);
  });
}

function wsMessageHandler(message: any, wsClient: CustomWSocket) {

  try {
    const parsedMessage = JSON.parse(message);

    console.log(parsedMessage);

    switch (parsedMessage.type) {
      case MessageTypes.Registration: {
        const result = userService.registration(JSON.parse(parsedMessage.data));
        const user = result.error ? undefined : (result as ResponseUser);

        if (user) {
          connectionHandler(wsClient, user.index);
        }

        sendMessageToThisConnection(MessageTypes.Registration, result, wsClient);

        const winners = winnerService.getWinnersList();
        messageToAll(MessageTypes.UpdateWinners, winners);

        const rooms = roomService.getAllNotFullRooms();
        sendMessageToThisConnection(MessageTypes.UpdateRoom, rooms, wsClient);

        break;
      }

      case MessageTypes.CreateRoom: {
        const currentUser = userService.getUserById(wsClient.id);
        const result = roomService.createNewRoom(currentUser);
        sendMessageToThisConnection(MessageTypes.CreateRoom, result, wsClient);

        const rooms = roomService.getAllNotFullRooms();
        messageToAll(MessageTypes.UpdateRoom, rooms);

        break;
      }

      case MessageTypes.AddUserToRoom: {
        const currentUser = userService.getUserById(wsClient.id);
        const result: any = roomService.addUserToRoom(currentUser, JSON.parse(parsedMessage.data));

        if (!result.error) {
          const newGame = gameService.createNewGame(currentUser.index);
          sendMessageToThisConnection(MessageTypes.CreateGame, newGame, wsClient);

          const id = roomService.getCompetitorIdFromRoom(currentUser.index, result);
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
          const currentId: string = data.indexPlayer;
          const startedGameData = gameService.startNewGame(data.gameId);

          const currentShipsData = {
            ships: startedGameData.playerShips.find((pShip: any) => pShip.indexPlayer === currentId),
            currentPlayerIndex: currentId,
          };

          sendMessageToThisConnection(MessageTypes.StartGame, currentShipsData, wsClient);

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
        sendMessageToThisConnection(null, { error: true, errorText: 'Unknown Message Type!' }, wsClient);

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

const sendMessageByConnectId = (type: MessageTypes, msg: any, id: string) => {
  wsServer.clients.forEach((client: any) => {
    console.log(client.id);

    if (client.id === id) {
      console.log('messageToAnother:');
      console.log(id);
      client.send(JSON.stringify({ type, data: JSON.stringify(msg), id: 0 }));
    }
  });
};

const sendMessageToThisConnection = (type: MessageTypes, data: any, ws: WebSocket): void => {
  ws.send(JSON.stringify({ type, data: JSON.stringify(data), id: 0 }));
};

function finishIfUserInGame(wsClient: CustomWSocket, id: string) {
  const gameId = gameService.findGameByUserId(id);

  if (gameId) {
    const data = { gameId, indexPlayer: id } as AttackDto;
    const winPlayer = gameService.getOtherPlayerIdFromAttackDto(data);

    sendMessageByConnectId(MessageTypes.Finish, { winPlayer }, winPlayer);
    const winners = winnerService.updateWinners(userService.getUserById(winPlayer));
    messageToAll(MessageTypes.UpdateWinners, winners);
  }
}
