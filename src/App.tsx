import {useState, useEffect} from 'react'
import './App.css'

const POPUP_INIT = {little: false, end: false}

export default function Home() {
    const [timer, setTimer] = useState(60) // Состояние для хранения времени таймера
    const [subHeader, setSubHeader] = useState('test')
    const [popUpClosed, setPopupClosed] = useState(POPUP_INIT)
    const [littleTime, setLittleTime] = useState(false)
    const [endTimePopup, setEndTime] = useState(false)
    const [background, setBackground] = useState('/background.jpg')

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
            } else if (data.type === 'start') {
                setPopupClosed(POPUP_INIT)
            } else if (data.type === 'background') {
                setBackground(data.value)
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
        if (timer === 0 && !popUpClosed.end) {
            setEndTime(true)
            return
        }
        if (timer === 300 && !popUpClosed.little) {
            setLittleTime(true)
        }


    }, [timer, popUpClosed])

    useEffect(() => {
        if (endTimePopup) {
            const video: HTMLElement | null = document.getElementById('video')
            if (null !== video && video.tagName === 'VIDEO')
            (video as HTMLVideoElement).play()
        }
    }, [endTimePopup])

    return (
        <>
            <div className={'background'} style={{backgroundImage: `url("${background}")`}}>
                <div className={'container'}>
                    {littleTime && <div className={'littleTime'}>
                        <img alt={'Кот агрессивно печатает'} src={'/cat-computer.gif'}/>
                        <span style={{fontSize: '24px'}}>Осталось 5 минут</span>
                        <button onClick={() => {
                            setLittleTime(false)
                            setPopupClosed(prevState => ({...prevState, little: true}))
                        }}>Закрыть уведомление</button>
                    </div>}
                    {endTimePopup && <div className={'littleTime'}>
                        <video id={'video'} src={'/cat.mp4'} loop
                               autoPlay style={{width: '100%'}}/>
                        <span style={{fontSize: '24px'}}>Время вышло!</span>
                        <button onClick={() => {
                            setEndTime(false)
                            setPopupClosed(prevState => ({...prevState, end: true}))
                        }}>Закрыть</button>
                    </div>}
                    <span style={{fontSize: '40px'}}>Компетенция "Графический дизайн"</span>
                    <div className={'subheadcontainer'}>
                        <span style={{fontSize: '40px'}}>{subHeader}</span>
                    </div>
                    <h1 style={{fontSize: '172px'}}>{Math.floor(timer / 3600)}:{Math.floor((timer % 3600) / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</h1>
                </div>
            </div>
        </>

    )
}