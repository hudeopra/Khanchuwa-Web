import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PrivateRoute from "./components/PrivateRoute";
import CreateRecipe from "./pages/CreateRecipe";
import RecipeList from "./pages/RecipeList"; // Import RecipeList component

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route element={<PrivateRoute />}>
          <Route path="/Profile" element={<Profile />} />
          <Route path="/create-recipe" element={<CreateRecipe />} />
        </Route>
        <Route path="/recipes" element={<RecipeList />} />{" "}
        {/* Add RecipeList route */}
      </Routes>
      <Footer />
    </Router>
  );
}
