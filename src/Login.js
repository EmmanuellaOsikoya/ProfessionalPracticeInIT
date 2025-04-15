import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
    //use state is used to create state variables for each form field
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const submit = async (e) => {
        e.preventDefault();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/profile"); // Redirects the user to the user profile page after login
        } catch (error) {
            setError("Invalid email or password");
        }
    };

    // Form that allows the user to login to MelodyMatch
    return (
        <div className="text-center" style={{ backgroundImage: 'url(/music.jpg)', height: '100vh', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="row justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="col-md-6 p-4 rounded shadow" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
                    <h2>Login</h2>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <form onSubmit={submit}>
                        <div className="form-group">
                            <label>Email: </label>
                            <input type="email"
                                className="form-control mx-auto"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '40%', height: '30px', fontSize: '14px' }} />
                        </div>
                        <div className="form-group">
                            <label>Password: </label>
                            <input type="password"
                                className="form-control mx-auto"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '40%', height: '30px', fontSize: '14px' }} />
                        </div>

                        <input type="submit" className="btn btn-primary" value="Login" />

                        <p>Don't have an account?</p>
                        <a href="/account" className="btn btn-primary">Register</a>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
