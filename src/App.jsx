import { Route, Routes, useNavigate } from "react-router-dom"
import Login from "./pages/Login/Login"
import Chat from "./pages/Chat/Chat"
import ProfileUpdate from "./pages/ProfileUpdate/ProfileUpdate"
import { ToastContainer } from 'react-toastify';
import { useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { AppContext } from "./context/Context"

function App() {
  let { setchatData } = useContext(AppContext)
  let navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        navigate("/chat")
        setchatData(null)
        Notification.permission !== "granted" && Notification.requestPermission()
      } else {
        navigate("/")
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<ProfileUpdate />} />
      </Routes>
    </>
  )
}

export default App
