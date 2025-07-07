import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import './App.css'

// Contexts
import { AuthProvider } from './contexts/AuthContext'

// Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Pages
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import ReviewPage from './pages/ReviewPage'
import SearchPage from './pages/SearchPage'
import LeaderboardPage from './pages/LeaderboardPage'
import StatusPage from './pages/StatusPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/review/:id" element={<ReviewPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/status" element={<StatusPage />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App