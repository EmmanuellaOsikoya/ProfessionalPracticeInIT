//Component that is responsible for creating accounts for MelodyMatch
import { useState } from "react";
import { db, auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Account() {
    //use state is used to create state variables for each form field
    const [userName, setUserName] = useState('');
    const [passWord, setPassWord] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
    
        if (passWord !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
    
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, emailAddress, passWord);
            const user = userCredential.user;
    
            await setDoc(doc(db, "users", user.uid), {
                userName: userName,
                email: emailAddress,
                createdAt: new Date()
            });
    
            navigate("/explore"); // Redirect after account creation
        } catch (error) {
            setError("Invalid email or password");
        }
    };

    //form that allows users to create a new account for to add to MelodyMatch
    return (
        <div className="text-center" style={{ backgroundImage: 'url(/music.jpg)', height: '100vh', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="row justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="col-md-6 p-4 rounded shadow" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
                    <h2>Create an Account</h2>
                    <form onSubmit={submit}>
                        <div className="form-group">
                            <label>User Name: </label>
                            <input type="text"
                                className="form-control mx-auto"
                                value={userName}
                                onChange={(e) => { setUserName(e.target.value) }}
                                style={{ width: '40%', height: '30px', fontSize: '14px', alignItems: 'center' }} />
                        </div>
                        <div className="form-group">
                            <label>Password: </label>
                            <input type="text"
                                className="form-control mx-auto"
                                value={passWord}
                                onChange={(e) => { setPassWord(e.target.value) }}
                                style={{ width: '40%', height: '30px', fontSize: '14px' }} />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password: </label>
                            <input type="text"
                                className="form-control mx-auto"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value) }}
                                style={{ width: '40%', height: '30px', fontSize: '14px' }} />
                        </div>
                        <div className="form-group">
                            <label>Email Address: </label>
                            <input type="text"
                                className="form-control mx-auto"
                                value={emailAddress}
                                onChange={(e) => { setEmailAddress(e.target.value) }}
                                style={{ width: '40%', height: '30px', fontSize: '14px' }} />
                        </div>
                        
                        <input type="submit" className="btn btn-primary" value="Register" />
        
                        <p>Already have an account?</p>
                        <a href="/login" className="btn btn-primary">Login</a>

                    </form>
                </div>
            </div>
        </div>
    );

}

export default Account;