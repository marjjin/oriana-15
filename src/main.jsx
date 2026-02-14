import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Header from './components/header/headers'
import Login from './components/login/login'
import Footer from './components/Footer/footer'
import './global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Header />
    <Login />
    <Footer />
  </StrictMode>,
)
