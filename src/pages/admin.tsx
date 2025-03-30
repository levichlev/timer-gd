import { useState, useEffect } from 'react';
import '../App.css'

export default function Admin() {
    const [timer, setTimer] = useState(60); // Состояние для хранения времени таймера
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(1);
    const [seconds, setSeconds] = useState(0);
    const [subHeader, setSubHeader] = useState('test');
    const [videoPlay, setVideoPlay] = useState(false)
    const [editing, setEditing] = useState(false);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        // Подключение к WebSocket-серверу
        const websocket = new WebSocket(`ws://${location.hostname}:8080`);

        websocket.onopen = () => {
            console.log('Подключено к WebSocket-серверу');
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'timer') {
                setTimer(data.value); // Обновляем состояние таймера
            } else if (data.type === 'subHeader') {
                setSubHeader(data.value)
            }
        };

        websocket.onclose = () => {
            console.log('Отключено от WebSocket-сервера');
        };

        setWs(websocket);

        // Очистка при размонтировании компонента
        return () => {
            websocket.close();
        };
    }, []);

    // Функция для отправки нового времени на сервер
    const sendNewTimer = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            ws.send(
                JSON.stringify({
                    type: 'setTimer',
                    hours,
                    minutes,
                    seconds,
                })
            );
        }
    };

    // Функция для отправки команды "пауза"
    const pauseTimer = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pause' }));
        }
    };

    // Функция для отправки команды "возобновить"
    const resumeTimer = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'resume' }));
        }
    };

    // Функция для отправки команды "остановить"
    const stopTimer = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'stop' }));
        }
    };

    const updateSubHeader = (newText) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({type: 'subHeader', value: newText}))
        }
    }

    useEffect(() => {
        if (timer === 0) {
            setVideoPlay(true)
            const video: HTMLVideoElement = document.getElementById('video')
            video?.play()
        }
    },[timer])

    return (
        <div className={'container'}>
            <video id={'video'} hidden={!videoPlay} className={'video'} src={'/cat.mp4'} loop autoPlay={videoPlay}/>
            <span style={{fontSize: '40px'}}>Компетенция "Графический дизайн"</span>
            <div className={'subheadcontainer'}>
                {editing ?
                    <>
                        <input value={subHeader} onChange={event => setSubHeader(event.target.value)}/>
                        <svg onClick={() => {
                            updateSubHeader(subHeader)
                            setEditing(false)
                        }} width="25" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M19.6437 4.55759C20.1158 4.84421 20.2661 5.45927 19.9795 5.93136L12.2116 18.7255C11.4963 19.9037 9.83142 20.0221 8.95654 18.9569L4.10243 13.0471C3.75189 12.6203 3.81369 11.9902 4.24047 11.6396C4.66725 11.2891 5.2974 11.3509 5.64793 11.7777L10.502 17.6875L18.2699 4.8934C18.5565 4.42131 19.1716 4.27097 19.6437 4.55759Z"
                                  fill="white"/>
                        </svg>

                    </>
                    : <>
                        <span style={{fontSize: '40px'}}>{subHeader}</span>
                        <svg onClick={() => setEditing(true)} width="25" height="25" viewBox="0 0 25 25" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M14.2897 6.32019L17.8287 9.85919L9.20584 18.4832C8.43258 19.2563 7.48119 19.8277 6.43534 20.147L3.53284 21.0331C3.35657 21.0869 3.17004 20.9876 3.11623 20.8113C3.09684 20.7478 3.09684 20.68 3.11623 20.6165L4.00223 17.7143C4.32157 16.6682 4.89307 15.7167 5.66646 14.9433L14.2897 6.32019ZM19.2408 3.49143L20.659 4.9097C21.2083 5.45883 21.2426 6.32789 20.7621 6.91705L20.659 7.03097L18.8897 8.79919L15.3497 5.25919L17.1194 3.49138C17.7052 2.90569 18.655 2.90571 19.2408 3.49143Z"
                                fill="white"/>
                        </svg>
                    </>

                }
            </div>
            <h1 style={{fontSize: '172px'}}>{Math.floor(timer / 3600)}:{Math.floor((timer % 3600) / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</h1>
            <div className={'buttons'}>
                <div>
                    <label>Часы:</label>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <button onClick={() => setHours((prev) => prev + 1)}>▲</button>
                        <span>{hours}</span>
                        <button onClick={() => setHours((prev) => Math.max(prev - 1, 0))}>▼</button>
                    </div>
                </div>

                <div>
                    <label>Минуты:</label>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                        <button onClick={() => setMinutes((prev) => prev + 1)}>▲</button>
                        <span>{minutes}</span>
                        <button onClick={() => setMinutes((prev) => Math.max(prev - 1, 0))}>▼</button>
                    </div>
                </div>

                <div>
                    <label>Секунды:</label>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                        <button onClick={() => setSeconds((prev) => prev + 1)}>▲</button>
                        <span>{seconds}</span>
                        <button onClick={() => setSeconds((prev) => Math.max(prev - 1, 0))}>▼</button>
                    </div>
                </div>
            </div>


            <button
                style={{marginTop: '20px'}}
                onClick={sendNewTimer}
            >
                Задать время
            </button>

            <div style={{marginTop: '20px'}}>
                <button onClick={pauseTimer}>Пауза</button>
                <button onClick={resumeTimer}>Запустить</button>
                <button onClick={() => {
                    const video: HTMLVideoElement = document.getElementById('video')
                    video?.pause()
                    setVideoPlay(false)
                }}>Выключить звук</button>
            </div>
        </div>
    );
}