const WebSocket = require('ws');

// Создаем WebSocket-сервер
const wss = new WebSocket.Server({ port: 8080 });

let timer = 60; // Начальное значение таймера (в секундах)
let interval;
let isPaused = false;
let subHeader = ''

// Функция для запуска таймера
function startTimer() {
    if (!interval && !isPaused) {
        interval = setInterval(() => {
            if (timer > 0) {
                timer--;
                broadcastTimer();
            } else {
                clearInterval(interval);
                interval = null;
            }
        }, 1000);
    }
}

// Функция для отправки текущего значения таймера всем клиентам
function broadcastTimer() {
    const message = JSON.stringify({ type: 'timer', value: timer });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
function broadcastSubHeader() {
    const message = JSON.stringify({ type: 'subHeader', value: subHeader });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Обработка подключений
wss.on('connection', (ws) => {
    console.log('Новый клиент подключен');

    // Отправляем текущее значение таймера новому клиенту
    ws.send(JSON.stringify({ type: 'timer', value: timer }));
    ws.send(JSON.stringify({ type: 'subHeader', value: subHeader }));

    // Запускаем таймер, если он еще не запущен и не на паузе
    if (!interval && !isPaused) {
        startTimer();
    }

    // Обработка сообщений от клиента
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'setTimer') {
            const { hours, minutes, seconds } = data;
            timer = hours * 3600 + minutes * 60 + seconds;
            broadcastTimer(); // Рассылаем новое значение таймера всем клиентам
        } else if (data.type === 'pause') {
            isPaused = true;
            clearInterval(interval);
            interval = null;
        } else if (data.type === 'resume') {
            isPaused = false;
            startTimer();
        } else if (data.type === 'stop') {
            isPaused = false;
            clearInterval(interval);
            interval = null;
            timer = 0;
            broadcastTimer();
        } else if (data.type === 'subHeader') {
            subHeader = data.value
            broadcastSubHeader()
        }
    });

    // Обработка отключения клиента
    ws.on('close', () => {
        console.log('Клиент отключен');
    });
});

console.log('WebSocket-сервер запущен на порту 8080');