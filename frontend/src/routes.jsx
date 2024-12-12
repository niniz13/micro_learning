import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Modules from './pages/Modules'
import ModuleDetail from './pages/ModuleDetail'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/modules" element={<Modules />} />
      <Route path="/modules/:id" element={<ModuleDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default AppRoutes
