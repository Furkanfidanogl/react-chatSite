import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID
} = import.meta.env;

const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

let auth = getAuth(app)
let db = getFirestore(app)

let onlineInterval = null

export { auth, db }

export let signup = async (username, email, password) => {
    try {
        let res = await createUserWithEmailAndPassword(auth, email, password)
        let user = res.user;

        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: "",
            avatar: "",
            bio: "Merhaba , ben FeeChat kullanıyorum!",
            online: true
        })

        toast("Kayıt oluşturuldu...")
    } catch (error) {
        console.error(error)
        toast.error(error.code)
    }
}

export let login = async (email, password) => {
    try {
        let res = await signInWithEmailAndPassword(auth, email, password)
        let user = res.user;

        await setDoc(doc(db, "users", user.uid), {
            online: true,
        }, { merge: true });

        // 1 dakikada bir online durumunu tekrar güncelle
        if (onlineInterval) clearInterval(onlineInterval);
        onlineInterval = setInterval(async () => {
            if (auth.currentUser) {
                await setDoc(doc(db, "users", auth.currentUser.uid), {
                    online: true
                }, { merge: true });
            }
        }, 60000);

        // Sayfa kapanınca offline yap
        window.addEventListener("beforeunload", () => {
            if (auth.currentUser) {
                navigator.sendBeacon(
                    "/updateOnlineStatus",
                    JSON.stringify({ uid: auth.currentUser.uid, online: false })
                );
            }
        });

        toast("Giriş yapıldı...")
    } catch (error) {
        toast.error(error.code)
    }
}

export let logout = async () => {
    try {
        let user = auth.currentUser;
        if (user) {
            await setDoc(doc(db, "users", user.uid), {
                online: false,
            }, { merge: true });
        }

        // Intervali temizle
        if (onlineInterval) clearInterval(onlineInterval);
        onlineInterval = null;

        await signOut(auth);
        toast("Çıkış yapıldı...");
    } catch (error) {
        toast.error(error.code)
    }
}

export let resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);

        toast("“Şifre sıfırlama linki e-posta adresinize gönderildi.Spam/junk klasörünüzü de kontrol etmeyi unutmayın.”");
    } catch (error) {
        toast.error(error.code)
    }
}