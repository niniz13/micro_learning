import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import theme from './theme'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Modules from './pages/Modules'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import AdminModules from './pages/AdminModules'
import ModuleForm from './pages/ModuleForm'
import ModulePages from './pages/ModulePages'
import ModuleView from './pages/ModuleView'
import { Provider } from 'react-redux';
import store from './store/store';

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/modules"
                  element={
                    <PrivateRoute>
                      <Modules />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/modules/:id"
                  element={
                    <PrivateRoute>
                      <ModuleView />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile/edit"
                  element={
                    <PrivateRoute>
                      <EditProfile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/modules"
                  element={
                    <AdminRoute>
                      <AdminModules />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/modules/create"
                  element={
                    <AdminRoute>
                      <ModuleForm />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/modules/:id/edit"
                  element={
                    <AdminRoute>
                      <ModuleForm />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/modules/:moduleId/pages"
                  element={
                    <AdminRoute>
                      <ModulePages />
                    </AdminRoute>
                  }
                />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </ChakraProvider>
    </Provider>
  )
}

export default App
