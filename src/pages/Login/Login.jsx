import "./Login.css"
import assets from "../../assets/assets"
import { useState } from "react"
import { signup, login } from "../../config/firebase"
import Modal from "../../components/Modal/Modal"

function Login() {
    let [currState, setcurrState] = useState("Giriş yap")
    let [forgetPassword, setforgetPassword] = useState(false)

    let [username, setusername] = useState("")
    let [email, setemail] = useState("")
    let [password, setpassword] = useState("")

    let formSubmitHandler = (e) => {
        e.preventDefault()
        if (currState === "Kayıt ol" && username.trim() !== "" && email.trim() !== "" && password.trim() !== "") {
            signup(username, email, password)
        }
        if (currState === "Giriş yap" && email.trim() !== "" && password.trim() !== "") {
            login(email, password)
        }
        setusername("")
        setpassword("")
    }

    return (
        <div className="login">
            <img src={assets.logo_big} alt="" className="logo" />
            {
                forgetPassword ?
                    <Modal setforgetPassword={setforgetPassword} />
                    :
                    <>
                        <form action="" className="login-form" onSubmit={formSubmitHandler}>
                            <h2>{currState}</h2>
                            {currState === "Kayıt ol" ? <input type="text" onChange={(e) => setusername(e.target.value)} value={username} placeholder="Kullanıcı Adı" className="form-input" required /> : null}
                            <input type="email" onChange={(e) => setemail(e.target.value)} value={email} placeholder="E-mail" className="form-input" required />
                            <input type="password" onChange={(e) => setpassword(e.target.value)} value={password} placeholder="Şifre" className="form-input" required />
                            <button type="submit">{currState}</button>
                            {
                                currState === "Kayıt ol" && (
                                    <label className="login-term">
                                        <input type="checkbox" required />
                                        <p>Kullanım koşullarını ve gizlilik politikasını kabul edin.</p>
                                    </label>
                                )
                            }
                            <div className="forgetPassword">
                                <p onClick={() => setforgetPassword(true)}>Şifremi unuttum</p>
                            </div>
                            <div className="login-forgot">
                                {currState === "Kayıt ol" ?
                                    <p className="login-toggle">
                                        Zaten hesabın var mı <span onClick={() => setcurrState("Giriş yap")}>Giriş yap</span>
                                    </p> :
                                    <p className="login-toggle">
                                        Hesabın yok mu <span onClick={() => setcurrState("Kayıt ol")}>Kayıt ol</span>
                                    </p>
                                }
                            </div>
                        </form>
                    </>
            }
        </div>
    )
}

export default Login