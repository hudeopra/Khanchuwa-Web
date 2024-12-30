import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import SignOut from "./pages/SignOut";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signout" element={<SignOut />} />
      </Routes>
    </BrowserRouter>
  );
}
