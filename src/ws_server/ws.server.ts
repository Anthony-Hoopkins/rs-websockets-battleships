import { MessageTypes } from '../core/consts/enums/message-types';
import { UserService } from '../services/user.service';
import { ResponseUser } from '../services/dto/user.dto';
import { RoomService } from '../services/room.service';
import { GameService } from '../services/game.service';
import { WebSocket, WebSocketServer } from 'ws';
import { WinnerService } from '../services/winner.service';
import { AddShipsDto, AttackDto, AttackRespDto, Coords, RandomAttackDto } from '../services/dto/game.dto';
import { CustomWSocket } from '../core/types/ws.type';
import { BOT_SHIPS, SIMPLE_BOT } from '../services/bot.service';

let wsServer: WebSocketServer;

const userService = new UserService();
const gameService = new GameService();
const roomService = new RoomService();
const winnerService = new WinnerService();

export function startWS() {
  const WS_PORT = 3000;

  wsServer = new WebSocketServer({ port: WS_PORT });
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

    closeUserRoomIfExists(id);

    console.log(`User ${userService.getUserById(id)?.name} is disconnected!`);
    userService.removeUserById(id);

    messageToAll(MessageTypes.UpdateRoom, roomService.getAllNotFullRooms());
  });
}

function sendMultipleMessageThenKilledShip(allFields: Coords[], attackerId: string, defenderId: string, status: 'missed' | 'killed') {
  allFields.forEach((position) => {
    sendMessageByConnectId(MessageTypes.Attack, {
      position,
      currentPlayer: attackerId,
      status: status,
    }, attackerId);

    sendMessageByConnectId(MessageTypes.Attack, {
      position,
      currentPlayer: attackerId,
      status: status,
    }, defenderId);
  });
}

function wsMessageHandler(message: any, wsClient: CustomWSocket) {

  try {
    const parsedMessage = JSON.parse(message);

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
        sendMessageToThisConnection(MessageTypes.CreateRoom, result.roomId, wsClient);

        const rooms = roomService.getAllNotFullRooms();
        messageToAll(MessageTypes.UpdateRoom, rooms);

        break;
      }

      case MessageTypes.AddUserToRoom: {
        const currentUser = userService.getUserById(wsClient.id);
        closeUserRoomIfExists(currentUser.index);
        const result: any = roomService.addUserToRoom(currentUser, JSON.parse(parsedMessage.data));

        if (result && !result.error) {
          const newGame = gameService.createNewGame(currentUser.index);
          roomService.closeRoomById(result?.roomId);

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

          sendMessageByConnectId(MessageTypes.StartGame, anotherShipsData, anotherShips.indexPlayer);
          gameService.setTurnToGame(data.gameId, currentId);
          sendMessageByConnectId(MessageTypes.Turn, { currentPlayer: currentId }, currentId);
        }

        break;
      }

      case MessageTypes.SinglePlay: {
        const currentUser = userService.getUserById(wsClient.id);
        closeUserRoomIfExists(currentUser.index);

        const result = roomService.createNewRoom(currentUser);
        roomService.addUserToRoom(SIMPLE_BOT, { indexRoom: result.roomId });

        const newGame = gameService.createNewGame(currentUser.index);
        roomService.closeRoomById(result.roomId);
        sendMessageToThisConnection(MessageTypes.CreateGame, newGame, wsClient);

        const rooms = roomService.getAllNotFullRooms();
        messageToAll(MessageTypes.UpdateRoom, rooms);

        gameService.addShipsToGame({ gameId: newGame.idGame, ships: BOT_SHIPS, indexPlayer: SIMPLE_BOT.index });

        break;
      }

      case MessageTypes.Attack: {
        attackAction(JSON.parse(parsedMessage.data), false);

        break;
      }

      case MessageTypes.RandomAttack: {
        attackAction(JSON.parse(parsedMessage.data), true);

        break;
      }

      default:
        console.log('Unknown Type!');
        sendMessageToThisConnection(null, { error: true, errorText: 'Unknown Message Type!' }, wsClient);

        break;
    }

    function attackAction(attack: AttackDto | RandomAttackDto, isRandom: boolean): void {
      const game = gameService.getGameById(attack.gameId);

      if (game.turnId !== attack.indexPlayer) {
        console.log('Incorrect turn!');
        return;
      }

      const attackerId = attack.indexPlayer;
      const defenderId = gameService.getOtherPlayerIdFromAttackDto(attack);

      const attackResult: AttackRespDto = gameService.attack(attack as AttackDto, isRandom, defenderId);

      if (attackResult.status === 'killed') {
        const result = gameService.getFieldsAround(attackResult.position, game, defenderId);
        sendMultipleMessageThenKilledShip(result.missed, attackerId, defenderId, 'missed');
        sendMultipleMessageThenKilledShip(result.killed, attackerId, defenderId, 'killed');
      }

      const isFinished = gameService.checkIfGameCompleted(defenderId, game);

      if (isFinished) {
        sendMessageByConnectId(MessageTypes.Finish, { winPlayer: attackerId }, attackerId);
        sendMessageByConnectId(MessageTypes.Finish, { winPlayer: attackerId }, defenderId);

        const winners = winnerService.updateWinners(userService.getUserById(attackerId));
        messageToAll(MessageTypes.UpdateWinners, winners);

        return;
      }

      sendMessageByConnectId(MessageTypes.Attack, { ...attackResult , currentPlayer: attackerId }, attackerId);
      sendMessageByConnectId(MessageTypes.Attack, { ...attackResult , currentPlayer: attackerId }, defenderId);

      if (game.turnId === 'bot') {
        return attackAction({ gameId: attack.gameId, indexPlayer: 'bot' }, true);
      }

      sendMessageByConnectId(MessageTypes.Turn, { currentPlayer: game.turnId }, attackerId);
      sendMessageByConnectId(MessageTypes.Turn, { currentPlayer: game.turnId }, defenderId);
    }
  } catch (error) {
    console.log('Error', error);
  }
}

const connectionHandler = (ws: any, id: any): void => {
  ws.id = id;
};

const messageToAll = (type: MessageTypes, msg: any): void => {
  wsServer.clients.forEach((client: any) => {
    client.send(JSON.stringify({ type, data: JSON.stringify(msg), id: 0 }));
  });
};

const sendMessageByConnectId = (type: MessageTypes, msg: any, id: string): void => {
  wsServer.clients.forEach((client: any) => {
    if (client.id === id) {
      client.send(JSON.stringify({ type, data: JSON.stringify(msg), id: 0 }));
    }
  });
};

const sendMessageToThisConnection = (type: MessageTypes, data: any, ws: WebSocket): void => {
  ws.send(JSON.stringify({ type, data: JSON.stringify(data), id: 0 }));
};

function finishIfUserInGame(wsClient: CustomWSocket, id: string): void {
  const gameId = gameService.findGameByUserId(id);

  if (gameId) {
    const data = { gameId, indexPlayer: id } as AttackDto;
    const winPlayer = gameService.getOtherPlayerIdFromAttackDto(data);

    sendMessageByConnectId(MessageTypes.Finish, { winPlayer }, winPlayer);
    const winners = winnerService.updateWinners(userService.getUserById(winPlayer));
    messageToAll(MessageTypes.UpdateWinners, winners);
  }
}

function closeUserRoomIfExists(id: string): void {
  roomService.removeRoomIfHasOwn(id);
}
