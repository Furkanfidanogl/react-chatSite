import { useContext, useEffect, useState } from "react"
import "./ProfileUpdate.css"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "../../config/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { upload } from "../../lib/upload"
import { AppContext } from "../../context/Context"
import assets from "../../assets/assets"

function ProfileUpdate() {
    let { setuserData } = useContext(AppContext)
    let navigate = useNavigate()

    let [newAvatar, setnewAvatar] = useState(false)

    let [name, setname] = useState("")
    let [bio, setbio] = useState("") //İlk başta bu 3'ü var mı kontrol ediliyor...
    let [avatar, setavatar] = useState("")

    let [uid, setuid] = useState("")

    let profileUptade = async (e) => {
        e.preventDefault()
        if (name.trim() === "" || bio.trim() === "") {
            toast.error("Lütfen eksiksiz doldurun!")
        }
        if (!avatar && !newAvatar) {
            return toast.error("Profil fotoğrafı yükleyin!")
        }
        try {
            toast.success("Profil güncellemesi kaydediliyor!")
            let imgUrl = newAvatar ? await upload(newAvatar) : avatar
            let docRef = doc(db, "users", uid)
            await updateDoc(docRef, {
                avatar: imgUrl,
                bio: bio,
                name: name.toLowerCase()
            })
            let docSnap = await getDoc(docRef)
            let docData = docSnap.data()
            setuserData(docData)
        }
        catch (error) {
            toast.error(error.code)
        }
        navigate("/chat")
    }

    //Önce var mı kontrol et ,varsa yükle
    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            setuid(user.uid)
            let docRef = doc(db, "users", user.uid)
            let docSnap = await getDoc(docRef)
            let docData = docSnap.data()

            if (docData.name) {
                setname(docData.name)
            }
            if (docData.bio) {
                setbio(docData.bio)
            }
            if (docData.avatar) {
                setavatar(docData.avatar)
            }
        })
    }, [])

    return (
        <div className="profile">
            <div className="profile-container">
                <form onSubmit={profileUptade}>
                    <h3>Kişisel Bilgiler</h3>
                    <label htmlFor="avatar">
                        <input onChange={(e) => setnewAvatar(e.target.files[0])} type="file" id="avatar" accept="image/*" hidden />
                        <img src={newAvatar ? URL.createObjectURL(newAvatar) : avatar ? avatar : assets.avatar_icon} alt="" />
                        Profil fotoğrafı yükle
                    </label>
                    <input onChange={(e) => setname(e.target.value)} value={name} type="text" placeholder="Adınız" required />
                    <textarea onChange={(e) => setbio(e.target.value)} value={bio} placeholder="Hakkında" required></textarea>
                    <button type="submit">Kaydet</button>
                </form>
                <img src={newAvatar ? URL.createObjectURL(newAvatar) : avatar ? avatar : assets.logo_icon} alt="" className="profile-pic" />
            </div>
        </div >
    )
}

export default ProfileUpdate