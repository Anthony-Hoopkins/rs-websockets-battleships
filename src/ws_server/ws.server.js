export function onConnect(wsClient) {
    console.log('New User');

    wsClient.send('Hello.');

    wsClient.on('message', (message) => {
        console.log(message);
        wsMessageHandler(message, wsClient);
    });

    wsClient.on('close', () => {
        console.log('User is disconnected!');
    });
}

function wsMessageHandler(message, wsClient) {
    try {
        // parse to object;
        const jsonMessage = JSON.parse(message);
        console.log(jsonMessage);

        switch (jsonMessage.action) {
            case 'ECHO':
                wsClient.send(jsonMessage.data);
                break;
            case 'PING':
                setTimeout(function () {
                    wsClient.send('PONG');
                }, 2000);
                break;
            default:
                console.log('Unknown command!');
                break;
        }
    } catch (error) {
        console.log('Error', error);
    }
}



