import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom"; // Import useParams
import PrivateRoute from "./components/PrivateRoute";
import { AlertProvider } from "./components/AlertContext";

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

// shop
import TagDetail from "./pages/TagDetail"; // Import TagDetail component
import TagList from "./pages/TagList"; // Import TagList component
import ProductEdit from "./pages/ProductEdit"; // Import ProductEdit component

// 404
import NotFound from "./pages/404"; // Import NotFound component
import PrivacyPolicy from "./pages/PrivacyPolicy"; // Import PrivacyPolicy
import TermsAndConditions from "./pages/TermsAndConditions"; // Import TermsAndConditions
// import AdminCookshop from "./pages/AdminCookshop"; // Import AdminCookshop component

function CookshopPageWrapper() {
  const { tagType } = useParams(); // Get tagType from the URL
  const pagename = tagType === "ingredientTag" ? "Cookshop" : "Category"; // Determine pagename based on tagType

  return (
    <>
      <Header pagename={pagename} />
      <TagDetail />
    </>
  );
}

export default function App() {
  return (
    <AlertProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header pagename="Home" />
                <Home />
              </>
            }
          />
          <Route
            path="/About"
            element={
              <>
                <Header pagename="About" />
                <About />
              </>
            }
          />
          <Route
            path="/SignIn"
            element={
              <>
                <Header pagename="Sign In" />
                <SignIn />
              </>
            }
          />
          <Route
            path="/SignUp"
            element={
              <>
                <Header pagename="Sign Up" />
                <SignUp />
              </>
            }
          />
          <Route element={<PrivateRoute />}>
            <Route
              path="/Profile"
              element={
                <>
                  <Header pagename="Profile" />
                  <Profile />
                </>
              }
            />
            <Route
              path="/profile-edit"
              element={
                <>
                  <Header pagename="Edit Profile" />
                  <ProfileEdit />
                </>
              }
            />
            <Route
              path="/create-recipe"
              element={
                <>
                  <Header pagename="Create Recipe" />
                  <CreateRecipe />
                </>
              }
            />
            <Route
              path="/user-recipe"
              element={
                <>
                  <Header pagename="My Recipes" />
                  <UserRecipie />
                </>
              }
            />
            <Route
              path="/recipes/edit/:id"
              element={
                <>
                  <Header pagename="Edit Recipe" />
                  <EditRecipe />
                </>
              }
            />
            <Route
              path="/create-blog"
              element={
                <>
                  <Header pagename="Create Blog" />
                  <CreateBlog />
                </>
              }
            />
            <Route
              path="/blog/edit/:id"
              element={
                <>
                  <Header pagename="Edit Blog" />
                  <EditBlog />
                </>
              }
            />
            <Route
              path="/user-blog"
              element={
                <>
                  <Header pagename="My Blogs" />
                  <UserBlog />
                </>
              }
            />
            <Route
              path="/product/edit/:id"
              element={
                <>
                  <Header pagename="Edit Product" />
                  <ProductEdit />
                </>
              }
            />
          </Route>
          <Route
            path="/recipes"
            element={
              <>
                <Header pagename="Recipes" />
                <RecipeList />
              </>
            }
          />
          <Route
            path="/search"
            element={
              <>
                <Header pagename="Search Results" />
                <RecipeList />
              </>
            }
          />
          <Route
            path="/recipes/:id"
            element={
              <>
                <Header pagename="Recipe Details" />
                <RecipeDetail />
              </>
            }
          />
          <Route
            path="/blogs"
            element={
              <>
                <Header pagename="Blogs" />
                <BlogList />
              </>
            }
          />
          <Route
            path="/blogs/:id"
            element={
              <>
                <Header pagename="Blog Details" />
                <BlogDetail />
              </>
            }
          />
          {/* <Route
            path="/admincookshop"
            element={
              <>
                <Header pagename="Admin Cookshop" />
                <AdminCookshop />
              </>
            }
          /> */}
          <Route
            path="/cookshop"
            element={
              <>
                <Header pagename="Cookshop" />
                <TagList tagType="ingredientTag" />
              </>
            }
          />
          <Route
            path="/cuisine"
            element={
              <>
                <Header pagename="Cuisine" />
                <TagList tagType="cuisineTag" /> {/* Corrected prop name */}
              </>
            }
          />
          <Route
            path="/flavour"
            element={
              <>
                <Header pagename="flavour" />
                <TagList tagType="flavourTag" /> {/* Corrected prop name */}
              </>
            }
          />
          <Route
            path="/cookshop/:tagType/:id"
            element={<CookshopPageWrapper />}
          />
          <Route
            path="*"
            element={
              <>
                <Header pagename="404 Not Found" />
                <NotFound />
              </>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <>
                <Header pagename="Privacy Policy" />
                <PrivacyPolicy />
              </>
            }
          />
          <Route
            path="/terms-and-conditions"
            element={
              <>
                <Header pagename="Terms and Conditions" />
                <TermsAndConditions />
              </>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </AlertProvider>
  );
}
