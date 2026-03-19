import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './lib/LanguageContext'
import './index.css'
import App from './App.tsx'
import SuccessPage from './pages/SuccessPage.tsx'
import CancelPage from './pages/CancelPage.tsx'
import AdminPage from './pages/AdminPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import MentionsLegalesPage from './pages/Mentionslegalespage.tsx'
import ConfidentialitePage from './pages/Confidentialitepage.tsx'
import CGUPage from './pages/Cgupage.tsx'
import ContactPage from './pages/Contactpage.tsx'
import AProposPage from './components/Apropospage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
          <Route path="/confidentialite" element={<ConfidentialitePage />} />
          <Route path="/cgu" element={<CGUPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/a-propos" element={<AProposPage />} />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)