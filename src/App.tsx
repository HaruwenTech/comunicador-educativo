import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './components/NotificationProvider';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to="/login" />;
};


function AppContent() {
  return (
    <>
      <Header />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          } />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
