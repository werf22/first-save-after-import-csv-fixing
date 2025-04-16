import { useState } from 'react'
import Home from "./pages/Home";
import { Login } from "./components/Login";
import './App.css'

function App() {
  const [auth, setAuth] = useState<{ username: string; password: string } | null>(null);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);

  const handleLogin = async (username: string, password: string) => {
    // Try a simple authenticated request to verify credentials
    try {
      const resp = await fetch("/api/tasks", {
        method: "GET",
        headers: {
          'Authorization': 'Basic ' + btoa(`${username}:${password}`)
        }
      });
      if (resp.status === 200) {
        setAuth({ username, password });
        setLoginError(undefined);
      } else {
        setLoginError("Invalid username or password.");
      }
    } catch {
      setLoginError("Unable to connect to server.");
    }
  };

  // Provide credentials to children via context or props (for now, simple prop drilling)
  if (!auth) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  // Patch fetch/axios globally for auth (for now, just pass to Home as props or use context in future)
  return <Home auth={auth} />;
}

export default App
