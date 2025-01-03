import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignOut from "./pages/SignOut";
import PrivateRoute from "./components/PrivateRoute";


export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route element={<PrivateRoute />}>
          <Route path="/Profile" element={<Profile />} />
          <Route path="/SignOut" element={<SignOut />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
