import { useState } from "react";
import { resetPassword } from "../../config/firebase";
import "./Modal.css";

const Modal = ({ setforgetPassword }) => {
    let [mail, setmail] = useState("")

    let formSubmitHandler = (e) => {
        e.preventDefault()
        resetPassword(mail)
        setforgetPassword(false) //Modal için state
    }

    return (
        <div className="modal-backdrop">
            <form className="modal-container" onSubmit={formSubmitHandler}>
                <button type="button" className="modalClose" onClick={() => setforgetPassword(false)}>×</button>
                <h2>Şifresini güncellemek istediğiniz mail adresini giriniz!</h2>
                <input 
                    type="email" 
                    onChange={(e) => setmail(e.target.value)} 
                    value={mail} 
                    placeholder="E-posta adresiniz" 
                    required 
                />
                <button>Şifreyi Güncelle</button>
            </form>
        </div>
    );
};

export default Modal;
