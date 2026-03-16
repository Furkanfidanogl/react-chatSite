import { useContext, useEffect, useState } from "react";
import assets from "../../assets/assets";
import "./LeftSideBar.css";
import { db, logout } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import { AppContext } from "../../context/Context";

function LeftSideBar() {
    let { userData, setchatData, setloading } = useContext(AppContext);

    let [displaySubMenu, setdisplaySubMenu] = useState(false);
    let navigate = useNavigate();

    let [inputValue, setinputValue] = useState("")
    let [searchResults, setSearchResults] = useState([]);
    let [historyChats, setHistoryChats] = useState([]);

    let inputHandler = async (e) => {
        try {
            let inputText = e.target.value.trim().toLowerCase();
            setinputValue(inputText)
            if (!inputText) {
                setSearchResults([]);
                return;
            }
            let q = query(
                collection(db, "users"),
                where("username", "==", inputText)
            );
            let querySnapShot = await getDocs(q);

            if (!querySnapShot.empty && userData.id !== querySnapShot.docs[0].data().id) {
                let foundUsers = [];
                querySnapShot.forEach((doc) => {
                    foundUsers.push(doc.data());
                });
                setSearchResults(foundUsers);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (!userData?.id) return;

        const q = query(
            collection(db, "chats"),
            where("users", "array-contains", userData.id)
        );

        const unsubscribe = onSnapshot(q, (querySnap) => {
            let chats = [];
            querySnap.forEach((doc) => {
                let data = doc.data();
                let otherUserId = data.users.find((uid) => uid !== userData.id);
                chats.push({
                    id: doc.id,
                    ...data,
                    other: data.userInfos[otherUserId],
                });
            });
            setHistoryChats(chats);
        });
        return () => unsubscribe();
    }, [userData?.id]);

    let addOpenChat = async (item) => {
        setloading(true);
        if (!item) return;

        const combinedID =
            userData.id > item.id ? userData.id + item.id : item.id + userData.id;
        const chatRef = doc(db, "chats", combinedID);

        try {
            const chatSnap = await getDoc(chatRef);
            if (!chatSnap.exists()) {
                await setDoc(chatRef, {
                    users: [userData.id, item.id],
                    userInfos: {
                        [userData.id]: {
                            id: userData.id,
                            avatar: userData.avatar,
                            name: userData.name,
                            bio: userData.bio,
                        },
                        [item.id]: {
                            id: item.id,
                            avatar: item.avatar,
                            name: item.name,
                            bio: item.bio,
                        },
                    },
                    messages: [],
                });
            }

            const unsubscribe = onSnapshot(chatRef, (docSnap) => {
                if (docSnap.exists()) {
                    let data = docSnap.data();
                    let otherUserId = data.users.find((uid) => uid !== userData.id);
                    setchatData({
                        ...data,
                        me: data.userInfos[userData.id],
                        other: data.userInfos[otherUserId],
                    });
                }
            });
            // 1 saniye sonra false yap
            setTimeout(() => setloading(false), 750);
            setinputValue("")
            setSearchResults([])
            return unsubscribe;
        } catch (error) {
            toast.error(error.message);
        }
    };


    return (
        <div className="ls">
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} alt="" className="logo" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" onClick={() => setdisplaySubMenu(!displaySubMenu)} />
                        {displaySubMenu && (
                            <div className="sub-menu">
                                <p onClick={() => navigate("/profile")}>Profili Düzenle</p>
                                <hr />
                                <p onClick={() => logout()}>Çıkış Yap</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="ls-search">
                    <img src={assets.search_icon} alt="" />
                    <input
                        onChange={inputHandler}
                        type="text"
                        placeholder="Kullanıcı adı"
                        value={inputValue}
                    />
                </div>
            </div>
            <div className="ls-list">
                {searchResults.length > 0
                    ? searchResults.map((item, index) => (
                        <div onClick={() => addOpenChat(item)} className="friends" key={index}>
                            <img src={item.avatar || assets.avatar_icon} alt="" />
                            <div>
                                <p>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</p>
                                <span>{item.bio}</span>
                            </div>
                        </div>
                    ))
                    : historyChats.length > 0
                        ? historyChats.map((chat, index) => (
                            <div
                                onClick={() => addOpenChat(chat.other)}
                                className="friends"
                                key={index}
                            >
                                <img src={chat.other.avatar || assets.avatar_icon} alt="" />
                                <div>
                                    <p>{chat.other.name.charAt(0).toUpperCase() + chat.other.name.slice(1)}</p>
                                    <span>{chat.other.bio}</span>
                                </div>
                            </div>
                        ))
                        : (
                            <p className="noFriends">Henüz sohbet yok!</p>
                        )}
            </div>
        </div>
    );
}

export default LeftSideBar;
