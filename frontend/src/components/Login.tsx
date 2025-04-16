import React, { useState } from "react";

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  error?: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Login Form" style={{ maxWidth: 320, margin: "2rem auto", padding: 24, border: "1px solid #ddd", borderRadius: 8, background: "#fff" }}>
      <h2 style={{ marginBottom: 16 }}>Login</h2>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="login-username">Username</label>
        <input
          id="login-username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
          required
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>
      {error && <div role="alert" style={{ color: "#c00", marginBottom: 8 }}>{error}</div>}
      <button type="submit" style={{ width: "100%", padding: 10, background: "#007bff", color: "#fff", border: "none", borderRadius: 4 }}>Login</button>
    </form>
  );
};
