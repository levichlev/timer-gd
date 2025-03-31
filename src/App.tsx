import {useState, useEffect} from 'react'
import './App.css'

export default function Home() {
    const [timer, setTimer] = useState(60) // Состояние для хранения времени таймера
    const [subHeader, setSubHeader] = useState('test')

    useEffect(() => {
        // Подключение к WebSocket-серверу
        const websocket = new WebSocket(`ws://${location.hostname}:8081`)

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


    return (
        <div className={'container'}>
            <span style={{fontSize: '40px'}}>Компетенция "Аналитический контроль"</span>
            <div className={'subheadcontainer'}>
                <span style={{fontSize: '40px'}}>{subHeader}</span>
            </div>
            <h1 style={{fontSize: '172px'}}>{Math.floor(timer / 3600)}:{Math.floor((timer % 3600) / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</h1>
        </div>
    )
}