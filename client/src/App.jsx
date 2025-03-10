import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CreateRecipe from "./pages/CreateRecipe";
import RecipeList from "./pages/RecipeList"; // Import RecipeList component
import RecipeDetail from "./pages/RecipeDetail"; // Import RecipeDetail component
import UserRecipie from "./pages/UserRecipie"; // Import UserRecipie component
import EditRecipe from "./pages/EditRecipe"; // Updated import name
import NotFound from "./pages/404"; // Import NotFound component

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
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="/create-recipe" element={<CreateRecipe />} />
          <Route path="/user-recipe" element={<UserRecipie />} />
          <Route path="/recipes/edit/:id" element={<EditRecipe />} />{" "}
          {/* Updated route for editing */}
        </Route>
        <Route path="/recipes" element={<RecipeList />} />
        <Route path="/search" element={<RecipeList />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="*" element={<NotFound />} /> {/* Add NotFound route */}
      </Routes>
      <Footer />
    </Router>
  );
}
