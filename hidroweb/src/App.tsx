import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate
} from "react-router-dom";

import Navbar from './componentes/Navbar/Navbar';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { ContainerStyles, ContentcontainerStyles, MainStyles } from './Global.styles';
import { Historics } from './pages/Historics/Historics';
import { Crop } from './pages/Crop/Crop';
import { Profile } from './pages/Profile/Profile';
import { Notifications } from './pages/Notifications/Notifications';
import ProtectedRoute from './componentes/ProtectedRoute/ProtectedRoute';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import "./App.css";
import { messaging } from './Firebase';
import { getToken } from 'firebase/messaging';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AlertProvider } from "./context/AlertContext";
import Footer from "./componentes/Footer/Footer";

function App() {
  const requestPermission = async () => {
    try {
      console.log('Requesting permission for notifications...');
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const token = await getToken(messaging, {
        vapidKey: 'BL3SYMRI3n303k7r4BhmX7nw6RT4TG3v8QjCrh0rR_sMw-WCkagvGo3I_Jjkh9IPxN0TzQU7U7qJzuBn1bd2F84',
        serviceWorkerRegistration: registration
      });
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };


  const Layout = () => {
    return (
      <div style={MainStyles}>
        <Navbar />
        <div className="container" style={ContainerStyles}>

          <div style={ContentcontainerStyles}>
            <Outlet />
          </div>
        </div>
        <Footer></Footer>
      </div>
    )
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/login" replace={true} />,
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/register",
      element: <Register />
    },
    {
      path: "/app",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "dashboard",
          element: <Dashboard />
        },
        {
          path: "historics",
          element: <Historics />
        },
        {
          path: "crop",
          element: <Crop />
        },
        {
          path: "notifications",
          element: <Notifications />
        },
        {
          path: "profile",
          element: <Profile />
        },
      ]
    }
  ]);

  return (
    <>
      <AlertProvider>
        <ToastContainer position="top-right" autoClose={5000} />
        <RouterProvider router={router} />
      </AlertProvider>
    </>
  );
}

export default App;
