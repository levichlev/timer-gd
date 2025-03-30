import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter, Route, Routes} from "react-router"
import * as React from "react"
import Admin from "./pages/admin.tsx"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
            <Route path={'/'} element={<App/>}/>
            <Route path={'/admin'} element={<Admin/>}/>
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)
