import { Routes, Route } from "react-router-dom";
import Video from "./pages/Video";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Landing from "./pages/Landing";

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/video"
            element={
              <ProtectedRoute>
                <Video />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
