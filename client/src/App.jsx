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

// Recipes
import CreateRecipe from "./pages/CreateRecipe";
import RecipeList from "./pages/RecipeList"; // Import RecipeList component
import RecipeDetail from "./pages/RecipeDetail"; // Import RecipeDetail component
import UserRecipie from "./pages/UserRecipie"; // Import UserRecipie component
import EditRecipe from "./pages/EditRecipe"; // Updated import name

// Blogs
import CreateBlog from "./pages/CreateBlog";
import BlogList from "./pages/BlogList"; // Import BlogList component
import BlogDetail from "./pages/BlogDetail"; // Import BlogDetail component
import UserBlog from "./pages/UserBlog"; // Import UserBlog component
import EditBlog from "./pages/EditBlog"; // Updated import name

// Blogs
import CreateProduct from "./pages/CreateProduct";
import ShopList from "./pages/ShopList"; // Import BlogList component
import ProductDetail from "./pages/ProductDetail"; // Import BlogDetail component
import UserProduct from "./pages/UserProduct"; // Import UserBlog component
import EditProduct from "./pages/EditProduct"; // Updated import name

// 404
import NotFound from "./pages/404"; // Import NotFound component
import PrivacyPolicy from "./pages/PrivacyPolicy"; // Import PrivacyPolicy
import TermsAndConditions from "./pages/TermsAndConditions"; // Import TermsAndConditions

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
          <Route path="/recipes/edit/:id" element={<EditRecipe />} />
          {/* blog pages */}
          <Route path="/create-blog" element={<CreateBlog />} />
          <Route path="/blog/edit/:id" element={<EditBlog />} />
          <Route path="/user-blog" element={<UserBlog />} />
          {/* Updated route for editing */}
          {/* Product pages */}
          <Route path="/create-product" element={<CreateProduct />} />
          <Route path="/product/edit/:id" element={<EditProduct />} />
          <Route path="/user-product" element={<UserProduct />} />
        </Route>
        <Route path="/recipes" element={<RecipeList />} />
        <Route path="/search" element={<RecipeList />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cookshop" element={<ShopList />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      </Routes>
      <Footer />
    </Router>
  );
}
