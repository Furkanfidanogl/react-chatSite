import { useContext, useEffect, useState } from "react"
import assets from "../../assets/assets"
import { auth, db, logout } from "../../config/firebase"
import "./RightSideBar.css"
import { AppContext } from "../../context/Context"
import { doc, getDoc } from "firebase/firestore"
import { toast } from "react-toastify"
import { onAuthStateChanged } from "firebase/auth"

function RightSideBar() {
    let { userData, chatData, loadUserData } = useContext(AppContext)

    let [isOnline, setisOnline] = useState(null)
    let [img, setimg] = useState(null)
    let [name, setname] = useState(null)
    let [bio, setbio] = useState(null)
    let [media, setmedia] = useState([])

    let loadClickedInfo = async () => {
        try {
            if (chatData) {
                let userRef = doc(db, "users", chatData.other.id)
                let userSnap = await getDoc(userRef)
                let userData = userSnap.data()
                setisOnline(userData.online)
                setimg(userData.avatar || assets.avatar_icon)
                setname(userData.name.charAt(0).toUpperCase() + userData.name.slice(1));
                setbio(userData.bio)
            }
        } catch (error) {
            toast.error(error)
        }
    }
    useEffect(() => {
        loadClickedInfo()

        if (chatData?.messages) {
            const pics = chatData.messages
                .filter(msg => msg.picture)
                .map(msg => msg.picture);
            setmedia(pics);
        }
    }, [chatData, chatData?.messages])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await loadUserData(user.uid)
            }
        })
        return () => unsubscribe()
    }, [])

    return (
        <div className="rs">
            {
                chatData ?
                    <>
                        <div className="rs-profile">
                            <img src={img} alt="" />
                            <h3>{name} {isOnline ? <img src={assets.green_dot} className="dot" alt="" /> : ""}</h3>
                            <p>{bio}</p>
                        </div>
                        <hr />
                        <div className="rs-media">
                            <p>Media</p>
                            <div>
                                {media.map((img, idx) => (
                                    <img loading="lazy" src={img} key={idx} alt="Gönderilen resim" />
                                ))}
                            </div>
                        </div>
                    </>
                    :
                    <div className="rs-profile">
                        <img src={userData && userData?.avatar || assets.avatar_icon} alt="" />
                        <h3>{userData && userData?.name?.charAt(0).toUpperCase() + userData.name?.slice(1)} <img src={assets.green_dot} className="dot" alt="" /></h3>
                        <p>{userData && userData?.bio}</p>
                    </div>
            }
            <hr />
            <button onClick={() => logout()}>Çıkış</button>
        </div>

    )
}

export default RightSideBar