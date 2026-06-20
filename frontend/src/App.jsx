import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import BuilderPage from "./pages/BuilderPage";
import FillPage from "./pages/FillPage";

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: "20px" }}>
        <Link to="/">Admin</Link> |{" "}
        <Link to="/user">User</Link>
      </div>

      <Routes>
        <Route path="/" element={<BuilderPage />} />
        <Route path="/user" element={<FillPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;