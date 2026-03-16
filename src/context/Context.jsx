import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { createContext } from "react";
import { toast } from "react-toastify";
import { db } from "../config/firebase";

export let AppContext = createContext()

export let AppContextProvider = ({ children }) => {
    let [userData, setuserData] = useState(null)
    let [chatData, setchatData] = useState(null)
    let [loading, setloading] = useState(false)

    let loadUserData = async (uid) => {
        try {
            let userRef = doc(db, "users", uid)
            let userSnap = await getDoc(userRef)
            let data = userSnap.data()
            setuserData(data)
        } catch (error) {
            toast.error("Veriler yüklenirken hata oluştu!", error)
            return null
        }
    }

    let value = {
        userData, setuserData,
        chatData, setchatData,
        loadUserData,
        loading, setloading
    }
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}
