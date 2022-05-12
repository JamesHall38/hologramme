import { initializeApp } from "firebase/app"
import {
    getAuth,
    signInAnonymously,
} from "firebase/auth"
import {
    getDatabase,
    ref,
    onValue
} from "firebase/database"
import { useEffect } from 'react'


const Firebase = ({ setFirebaseLoader }) => {

    useEffect(() => {
        // Initialize Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyAZMILiIxET9X6cC3_zcBf-dyhEs0FH25g",
            authDomain: "hologramme-160ba.firebaseapp.com",
            databaseURL: "https://hologramme-160ba-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "hologramme-160ba",
            storageBucket: "hologramme-160ba.appspot.com",
            messagingSenderId: "100002171069",
            appId: "1:100002171069:web:9308fa56c1e0d0d2cb8fd4"
        }
        const app = initializeApp(firebaseConfig)
        const auth = getAuth(app)

        function getSource() {
            const db = getDatabase();
            const starCountRef = ref(db, 'users/test')
            onValue(starCountRef, (snapshot) => {
                const data = snapshot.val()
                const source = data
                // console.log(source)
                setFirebaseLoader(source)
            })
        }

        // function writeUserData() {
        //     const db = getDatabase()
        //     console.log(db);
        //     set(ref(db, 'users/test'), {
        //         // id: userId,
        //         name: "eff",
        //     })
        // }
        // console.log("2ffois")
        signInAnonymously(auth, app)
            .catch((e) => console.error('Anonymous sign in failed: ', e))
            .then(() => {
                console.log('Anonymous sign in succeeded')
                // const userId = auth.currentUser.uid;
                // writeUserData()
                getSource()
            })
    }, [setFirebaseLoader])

    return null
}

export default Firebase
