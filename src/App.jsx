import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Components/Login";
import Signup from "./Components/Signup";
import StandardsPage from "./Pages/StandardsPage";
import Home from "./Pages/Home";
import Chat from "./Pages/Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/standards"
          element={<StandardsPage />}
        />

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/chat"
          element={<Chat />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;