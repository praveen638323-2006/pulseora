import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import CreatePoll from "./pages/createpoll";
import Poll from "./pages/poll";
import Result from "./pages/result";
import LivePoll from "./pages/livepoll";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/create-poll"
            element={<CreatePoll />}
          />

          <Route
            path="/live-polls"
            element={<LivePoll />}
          />

          <Route
            path="/poll/:id"
            element={<Poll />}
          />

          <Route
            path="/result/:id"
            element={<Result />}
          />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;