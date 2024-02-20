import { MessageTypes } from '../core/consts/enums/message-types';
import { UserService } from '../services/user.service';
import { ResponseUser } from '../services/user.dto';

export function onConnect(wsClient: any) {
  console.log('New connection...');

  wsClient.on('message', (message: any) => {
    wsMessageHandler(message, wsClient);
  });
}

function wsMessageHandler(message: any, wsClient: any) {
  const sendMessage = (type: MessageTypes, data: string): void => {
    wsClient.send(JSON.stringify({ type, data, id: 0 }));
  };

  try {
    const parsedMessage = JSON.parse(message);
    let currentUsername: string;

    console.log(parsedMessage);

    const userService = new UserService();


    switch (parsedMessage.type) {
      case MessageTypes.Registration:
        const result = userService.registrationOrLogin(JSON.parse(parsedMessage.data));
        currentUsername = result.error ? undefined : (result as ResponseUser).name;

        sendMessage(MessageTypes.Registration, JSON.stringify(result));
        sendMessage(MessageTypes.UpdateWinners, JSON.stringify(result));
        sendMessage(MessageTypes.UpdateRoom, JSON.stringify(result));

        break;
      case MessageTypes.CreateRoom:
        // console.log('CreateRoom');
        // const room = userService.registrateNewUser(JSON.parse(parsedMessage.data));

        wsClient.send(JSON.stringify({
          type: MessageTypes.AddUserToRoom,
          data: JSON.stringify([{ name: 'Ury', wins: 7 }, { name: 'Jeka', wins: 3 }]),
          id: 0,
        }));

        wsClient.send(JSON.stringify({
          type: MessageTypes.UpdateRoom,
          data: JSON.stringify([
            { roomId: 1, roomUsers: [{ name: 'Lev', index: 1 }] },
            { roomId: 2, roomUsers: [{ name: 'Kesha', index: 2 }] },
          ]),
          id: 0,
        }));

        break;

      default:
        console.log('Unknown Type!');
        sendMessage(null, JSON.stringify({ error: true, errorText: 'Unknown Message Type!' }));

        break;
    }

    wsClient.on('close', () => {
      console.log(`User ${currentUsername} is disconnected!`);
    });

  } catch (error) {
    console.log('Error', error);
  }
}



