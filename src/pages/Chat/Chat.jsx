import { useEffect, useState } from "react"
import ChatBox from "../../components/ChatBox/ChatBox"
import LeftSideBar from "../../components/LeftSideBar/LeftSideBar"
import RightSideBar from "../../components/RightSideBar/RightSideBar"
import "./Chat.css"
import Loading from "../Loading/Loading"

function Chat() {
    let [loading, setloading] = useState(false)

    useEffect(() => {
        setloading(true)
        setTimeout(() => setloading(false), 1250)
    }, [])

    return (
        < div className="chat" >
            {
                loading ? <Loading />
                    :
                    <div className="chat-container">
                        <LeftSideBar />
                        <ChatBox />
                        <RightSideBar />
                    </div>
            }
        </div >
    )
}

export default Chat