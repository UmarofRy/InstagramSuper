import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from '../pages/Home.jsx'
import Explore from '../pages/Explore.jsx'
import Upload from '../pages/Upload.jsx'
import Profile from '../pages/Profile.jsx'
import Reels from '../pages/Reels.jsx'
import AdminPanel from '../pages/AdminPanel.jsx'
import Messages from '../pages/Messages.jsx'
import Login from '../pages/Login.jsx'
import Post from '../pages/Post.jsx'

import Notifications from '../pages/Notifications.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'

export default function AppRouter() {
  const location = useLocation()
  useEffect(() => { window.scrollTo({ top: 0 }) }, [location.pathname])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/reels" element={<Reels />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/post/:id" element={<Post />} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminPanel /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
