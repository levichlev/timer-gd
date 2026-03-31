const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let timer = 60;
let interval = null;
let isPaused = true;        // таймер на паузе
let subHeader = '';
let background = '/image.gif';

function startTimer() {
    if (interval) clearInterval(interval);
    interval = null;
    if (isPaused) return;
    if (timer <= 0) return;

    interval = setInterval(() => {
        if (timer > 0 && !isPaused) {
            timer--;
            broadcastMessage('timer', timer);
            if (timer === 0) {
                clearInterval(interval);
                interval = null;
                isPaused = false;
                broadcastMessage('status', false);
            }
        } else if (timer === 0) {
            clearInterval(interval);
            interval = null;
        }
    }, 1000);
}

function broadcastMessage(type, value) {
    const message = JSON.stringify({ type, value });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
    console.log(`Broadcast: ${message}`);
}

wss.on('connection', (ws) => {
    console.log('Клиент подключён');

    ws.send(JSON.stringify({ type: 'timer', value: timer }));
    ws.send(JSON.stringify({ type: 'subHeader', value: subHeader }));
    ws.send(JSON.stringify({ type: 'background', value: background }));
    ws.send(JSON.stringify({ type: 'status', value: isPaused }));

    if (!isPaused && timer > 0 && !interval) {
        startTimer();
    }

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Получено:', data);

        switch (data.type) {
            case 'setTimer': {
                const { hours, minutes, seconds } = data;
                const newTimer = hours * 3600 + minutes * 60 + seconds;
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                timer = newTimer;
                isPaused = true;   // не запускать автоматически
                broadcastMessage('timer', timer);
                broadcastMessage('status', true);
                break;
            }
            case 'pause':
                if (!isPaused && interval) {
                    isPaused = true;
                    clearInterval(interval);
                    interval = null;
                    broadcastMessage('status', true);
                }
                break;
            case 'resume':
                if (isPaused && timer > 0) {
                    isPaused = false;
                    broadcastMessage('status', false);
                    startTimer();
                }
                break;
            case 'stop':
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                timer = 0;
                isPaused = false;
                broadcastMessage('timer', 0);
                broadcastMessage('status', false);
                break;
            case 'subHeader':
                subHeader = data.value;
                broadcastMessage('subHeader', subHeader);
                break;
            case 'background':
                background = data.value;
                broadcastMessage('background', background);
                break;
            default:
                console.log('Неизвестный тип события:', data.type);
        }
    });

    ws.on('close', () => console.log('Клиент отключён'));
});

console.log('WebSocket-сервер запущен на порту 8080');