import { useContext, useEffect, useState } from "react"
import assets from "../../assets/assets"
import "./ChatBox.css"
import { deleteDoc, doc, getDoc, Timestamp } from "firebase/firestore"
import { db } from "../../config/firebase"
import { AppContext } from "../../context/Context"
import { toast } from "react-toastify"
import { updateDoc, arrayUnion } from "firebase/firestore";
import { upload } from "../../lib/upload"
import { FaTrash } from "react-icons/fa"

function ChatBox() {
    let { chatData, setchatData, userData, loading } = useContext(AppContext)

    let [isOnline, setisOnline] = useState(null)
    let [name, setname] = useState(null)
    let [img, setimg] = useState(null)

    let [msgText, setmsgText] = useState("")
    let [msgImg, setmsgImg] = useState("")
    let [msgAudio, setmsgAudio] = useState(null) //Audio File
    let [mediaRecorder, setmediaRecorder] = useState(null) //Start or Stop Record Functions

    let [msgSending, setmsgSending] = useState(false)

    let loadConversation = async () => {
        try {
            if (chatData) {
                let userRef = doc(db, "users", chatData.other.id)
                let userSnap = await getDoc(userRef)
                let userData = userSnap.data()
                setisOnline(userData.online)
                setname(userData.name.charAt(0).toUpperCase() + userData.name.slice(1));
                setimg(userData.avatar || assets.avatar_icon)
            }
        } catch (error) {
            toast.error(error)
        }
    }
    useEffect(() => {
        loadConversation()
    }, [chatData])

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!msgText && !msgImg && !msgAudio) return;

        setmsgSending(true)
        const combinedID = chatData.users[0] > chatData.users[1] ? chatData.users[0] + chatData.users[1] : chatData.users[1] + chatData.users[0];
        const chatRef = doc(db, "chats", combinedID);
        await updateDoc(chatRef, {
            messages: arrayUnion({
                senderId: userData.id,
                text: msgText,
                picture: msgImg ? await upload(msgImg) : "",
                audio: msgAudio ? await upload(msgAudio) : "",
                timeAt: Timestamp.now()
            })
        });
        setmsgSending(false)

        setmsgText("");
        setmsgImg("");
        setmsgAudio(null)
        setmediaRecorder(null)
    };

    const startRecording = async () => {
        if (mediaRecorder) return;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        let chunks = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "audio/webm" });
            const file = new File([blob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
            setmsgAudio(file);
        };

        recorder.start()
        setmediaRecorder(recorder);
    };
    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setmediaRecorder(null);
            toast.info("Ses başarıyla kaydedildi!")
        }
    };


    let deleteChat = async () => {
        if (!chatData) return;

        toast.success("Sohbet silindi!");
        try {
            const combinedID =
                chatData.users[0] > chatData.users[1]
                    ? chatData.users[0] + chatData.users[1]
                    : chatData.users[1] + chatData.users[0];

            const chatRef = doc(db, "chats", combinedID);
            await deleteDoc(chatRef);
            setchatData(null);
        } catch (error) {
            toast.error("Sohbet silinirken hata oluştu: " + error.message);
        }
    };

    return (
        <div className="chat-box">
            {
                loading ? <div className="chat-user">Yükleniyor...</div>
                    :
                    chatData ?
                        <>
                            <div className="chat-user">
                                <img src={img} alt="" />
                                <p>{name} {isOnline ? <img className="dot" src={assets.green_dot} alt="" /> : ""} </p>
                                <div className="info">
                                    <img src={assets.help_icon} className="help" alt="" />
                                    <div onClick={deleteChat} title="Sohbeti sil" style={{ display: "flex", cursor: "pointer" }}><FaTrash size={22} /></div>
                                    <p onClick={() => setchatData(null)} title="Sohbeti kapat" className="close">X</p>
                                </div>
                            </div>
                            <div className="chat-msg">
                                {
                                    chatData.messages.slice().reverse().map((item, index) => (
                                        <div
                                            className={item.senderId === userData.id ? "sendered-msg" : "recieved-msg"}
                                            key={index}
                                        >
                                            <div className="msg-content">
                                                {item.text && <p className="msg-text">{item.text}</p>}
                                                {item.picture && <img className="msg-img" src={item.picture} alt="gönderilen" loading="lazy" />}
                                                {item.audio && (
                                                    <audio controls key={item.audio}>
                                                        <source src={item.audio} type="audio/webm" />
                                                    </audio>
                                                )}
                                            </div>

                                            <div>
                                                <img
                                                    src={item.senderId === userData.id ? userData.avatar : chatData.other.avatar}
                                                    alt=""
                                                    className="avatar"
                                                    loading="lazy"
                                                />
                                                <p>
                                                    {item.timeAt?.toDate().toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit', year: '2-digit' })}{" "}
                                                    {item.timeAt?.toDate().toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            <form action="" onSubmit={sendMessage}>
                                <div className="chat-input">
                                    <input type="text" onChange={(e) => setmsgText(e.target.value)} value={msgText} placeholder="Mesaj Gönder" />
                                    <input type="file" id="image" onChange={(e) => setmsgImg(e.target.files[0])} accept="image/*" hidden />
                                    {!mediaRecorder ?
                                        <span style={{ cursor: "pointer" }} onClick={startRecording}>🎙️</span> :
                                        <span style={{ cursor: "pointer" }} onClick={stopRecording}>⏹️</span>
                                    }

                                    {msgImg && (
                                        <div className="preview-container">
                                            <img
                                                src={URL.createObjectURL(msgImg)}
                                                alt="Önizleme"
                                                className="preview-img"
                                            />
                                        </div>
                                    )}
                                    <label htmlFor="image">
                                        <img src={assets.gallery_icon} alt="" />
                                    </label>
                                    {
                                        msgSending ? <p className="sending">Gönderiliyor...</p> : <img src={assets.send_button} alt="" onClick={sendMessage} />
                                    }
                                </div>
                            </form>
                        </>
                        :
                        <img src={assets.logo} className="noConversation"></img>
            }
        </div>
    )
}

export default ChatBox