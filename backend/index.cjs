const WebSocket = require('ws');

// Создаем WebSocket-сервер
const wss = new WebSocket.Server({ port: 8080 });

let timer = 60; // Начальное значение таймера (в секундах)
let interval;
let isPaused = false;
let subHeader = ''
let background = '/background.jpg'

// Функция для запуска таймера
function startTimer() {
    if (!interval && !isPaused) {
        broadcastMessage('start', timer);
        interval = setInterval(() => {
            if (timer > 0) {
                timer--;
                broadcastMessage('timer', timer);
            } else {
                clearInterval(interval);
                interval = null;
            }
        }, 1000);
    }
}

// функция для отправки сообщения всем клиентам
const broadcastMessage = (type, value) => {
    const message = JSON.stringify({ type, value });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
            console.log('Отправлена рассылка:', message)
        }
    });
}


// Обработка подключений
wss.on('connection', (ws) => {
    console.log('Новый клиент подключен');

    // Отправляем текущее значение таймера новому клиенту
    ws.send(JSON.stringify({ type: 'timer', value: timer }));
    ws.send(JSON.stringify({ type: 'subHeader', value: subHeader }));
    ws.send(JSON.stringify({ type: 'background', value: background }));

    // Запускаем таймер, если он еще не запущен и не на паузе
    if (!interval && !isPaused) {
        startTimer();
    }

    // Обработка сообщений от клиента
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Получено сообщение:', data)

        if (data.type === 'setTimer') {
            const { hours, minutes, seconds } = data;
            timer = hours * 3600 + minutes * 60 + seconds;
            broadcastMessage('timer', timer); // Рассылаем новое значение таймера всем клиентам
        } else if (data.type === 'pause') {
            isPaused = true;
            clearInterval(interval);
            interval = null;
        } else if (data.type === 'resume') {
            isPaused = false;
            startTimer();
            broadcastMessage('start', timer);
        } else if (data.type === 'stop') {
            isPaused = false;
            clearInterval(interval);
            interval = null;
            timer = 0;
            broadcastMessage('timer', timer);
        } else if (data.type === 'subHeader') {
            subHeader = data.value
            broadcastMessage('subHeader', subHeader)
        } else if (data.type === 'background') {
            background = data.value
            broadcastMessage('background', background)
        }
    });

    // Обработка отключения клиента
    ws.on('close', () => {
        console.log('Клиент отключен');
    });
});

console.log('WebSocket-сервер запущен на порту 8080');