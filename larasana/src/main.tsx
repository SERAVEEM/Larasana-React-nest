import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'lenis/dist/lenis.css'
import './style/index.css'
import LandingPages from './pages/LandingPages.tsx'
import StoryTelling from './pages/StoryTelling.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import HeroShowcasePage from './pages/HeroShowcasePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><LandingPages /><StoryTelling /><HeroShowcasePage /></>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
