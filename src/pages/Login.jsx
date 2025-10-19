import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getUsers, createUser } from "../api/users.js";
import { listAuthUsers, registerAuthUser } from "../api/authApi.js";
import { emailValid, nicknameValid } from "../utils/validators.js";
import "../styles/Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // === RESET FORM ===
  const resetFields = () => {
    setEmail("");
    setPassword("");
    setNickname("");
    setConfirm("");
    setError("");
  };

  // === LOGIN ===
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authUsers = await listAuthUsers();
      const match = (authUsers || []).find(
        (u) => u.email === email.trim() && u.password === password
      );

      if (!match) {
        setError("Invalid email or password");
        return;
      }

      const users = await getUsers();
      let found = (users || []).find((u) => u.email === email.trim());

      if (!found) {
        // Create user if missing in main table
        found = await createUser({
          recordType: "user",
          email: email.trim(),
          password,
          nickname: email.split("@")[0],
          role: "user",
          createdAt: new Date().toISOString(),
        });
      }

      login(found);
      resetFields();
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // === REGISTER ===
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // === VALIDATIONS ===
    if (!emailValid(email)) {
      setError("Invalid email format");
      setLoading(false);
      return;

    }
    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const existing = await getUsers();
      if ((existing || []).some((u) => u.email === email.trim())) {
        setError("Email already in use");
        setLoading(false);
        return;
      }
      if ((existing || []).some((u) => u.nickname === nickname.trim())) {
        setError("Nickname already in use");
        setLoading(false);
        return;
      }

      // === ADMINLARNI ANIQLASH ===
      const ADMIN_EMAILS = ["abdulloh@gmail.com", "owner@gmail.com"];
      const ADMIN_NICKNAMES = ["UmarofDev", "owner"];

      const isAdmin =
        ADMIN_EMAILS.includes(email.trim().toLowerCase()) ||
        ADMIN_NICKNAMES.includes(nickname.trim().toLowerCase());

      const payload = {
        recordType: "user",
        email: email.trim(),
        password,
        nickname: nickname.trim(),
        avatarUrl: "",
        bio: "",
        followers: [],
        following: [],
        posts: [],
        verified: isAdmin,
        subscribers: 0,
        blocked: false,
        role: isAdmin ? "admin" : "user",
        createdAt: new Date().toISOString(),
      };

      // Save to both APIs
      await registerAuthUser({
        email: payload.email,
        password: payload.password,
        nickname: payload.nickname,
      });

      const saved = await createUser(payload);
      login(saved);
      resetFields();
      navigate("/");
    } catch (err) {
      console.error("Register error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="box">
      <div className={`wrapper ${isSignUp ? "animated-signin" : "animated-signup"}`}>
        {/* === SIGN UP === */}
        <div className="form-container sign-up">
          <form onSubmit={handleRegister}>
            <h2>Sign Up</h2>

            <div className="form-group">
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <i className="fas fa-user"></i>
              <label>Username</label>
            </div>

            <div className="form-group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <i className="fas fa-at"></i>
              <label>Email</label>
            </div>

            <div className="form-group">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i className="fas fa-lock"></i>
              <label>Password</label>
            </div>

            <div className="form-group">
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <i className="fas fa-lock"></i>
              <label>Confirm Password</label>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </button>

            {error && <div className="error-msg">{error}</div>}

            <div className="link">
              <p>
                Already have an account?
                <a
                  href="#"
                  onClick={() => setIsSignUp(false)}
                  className="signin-link"
                >
                  {" "}
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* === SIGN IN === */}
        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h2>Login</h2>

            <div className="form-group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <i className="fas fa-at"></i>
              <label>Email</label>
            </div>

            <div className="form-group">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i className="fas fa-lock"></i>
              <label>Password</label>
            </div>

            <div className="forgot-pass">
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            {error && <div className="error-msg">{error}</div>}

            <div className="link">
              <p>
                Don’t have an account?
                <a
                  href="#"
                  onClick={() => setIsSignUp(true)}
                  className="signup-link"
                >
                  {" "}
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
