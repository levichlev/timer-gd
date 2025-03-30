import {useState, useEffect} from 'react'
import './App.css'

export default function Home() {
    const [timer, setTimer] = useState(60) // Состояние для хранения времени таймера
    const [subHeader, setSubHeader] = useState('test')
    const [videoPlay, setVideoPlay] = useState(false)

    useEffect(() => {
        // Подключение к WebSocket-серверу
        const websocket = new WebSocket(`ws://${location.hostname}:8080`)

        websocket.onopen = () => {
            console.log('Подключено к WebSocket-серверу')
        }

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === 'timer') {
                setTimer(data.value) // Обновляем состояние таймера
            } else if (data.type === 'subHeader') {
                setSubHeader(data.value)
            }
        }

        websocket.onclose = () => {
            console.log('Отключено от WebSocket-сервера')
        }

        // Очистка при размонтировании компонента
        return () => {
            websocket.close()
        }
    }, [])


    useEffect(() => {
        if (timer === 0) {
            setVideoPlay(true)
            const video: HTMLVideoElement = document.getElementById('video')
            video?.play()
        }
    }, [timer])

    return (
        <div className={'container'}>
            <video id={'video'} hidden={!videoPlay} className={'video'} src={'/cat.mp4'} loop autoPlay={videoPlay}/>
            <span style={{fontSize: '40px'}}>Компетенция "Графический дизайн"</span>
            <div className={'subheadcontainer'}>
                <span style={{fontSize: '40px'}}>{subHeader}</span>
            </div>
            <h1 style={{fontSize: '172px'}}>{Math.floor(timer / 3600)}:{Math.floor((timer % 3600) / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</h1>
            <div className={'buttons'}>
                <button onClick={() => {
                    const video: HTMLVideoElement = document.getElementById('video')
                    video?.pause()
                    setVideoPlay(false)
                }}>Выключить звук
                </button>
            </div>
        </div>
    )
}