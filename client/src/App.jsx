import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom"; // Import useParams
import PrivateRoute from "./components/PrivateRoute.jsx";
import { AlertProvider, useAlert } from "./components/AlertContext.jsx"; // Import useAlert

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Profile from "./pages/Profile.jsx";
import ProfileEdit from "./pages/ProfileEdit.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import Contact from "./pages/Contact.jsx"; // Import Contact page
import SiteMap from "./pages/SiteMap.jsx"; // Import SiteMap
import Faq from "./pages/Faq.jsx"; // Import FAQ page

// Recipes
import CreateRecipe from "./pages/CreateRecipe.jsx";
import RecipeList from "./pages/RecipeList.jsx"; // Import RecipeList component
import RecipeDetail from "./pages/RecipeDetail.jsx"; // Import RecipeDetail component
import UserRecipie from "./pages/UserRecipie.jsx"; // Import UserRecipie component
import EditRecipe from "./pages/EditRecipe.jsx"; // Updated import name
import AdminAllRecipe from "./pages/AdminAllRecipe.jsx"; // Import AdminAllRecipe component
import AdminTagDetail from "./pages/AdminTagDetail.jsx"; // Import AdminTagDetail component
import AdminCookshop from "./pages/AdminCookshop.jsx"; // Import AdminCookshop component

// Blogs
import CreateBlog from "./pages/CreateBlog.jsx";
import BlogList from "./pages/BlogList.jsx"; // Import BlogList component
import BlogDetail from "./pages/BlogDetail.jsx"; // Import BlogDetail component
import UserBlog from "./pages/UserBlog.jsx"; // Import UserBlog component
import EditBlog from "./pages/EditBlog.jsx"; // Updated import name

// shop
import TagDetail from "./pages/TagDetail.jsx"; // Import TagDetail component
import TagList from "./pages/TagList.jsx"; // Import TagList component
import ProductEdit from "./pages/ProductEdit.jsx"; // Import ProductEdit component

// 404
import NotFound from "./pages/404.jsx"; // Import NotFound component
// import PrivacyPolicy from "./pages/PrivacyPolicy.jsx"; // Import PrivacyPolicy
import TermsAndConditions from "./pages/TermsAndConditions.jsx"; // Import TermsAndConditions
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import Checkout from "./pages/Checkout.jsx"; // Import Checkout component

import Failure from "./components/Failure.jsx";
import Orderlist from "./pages/Orderlist.jsx"; // Import Orderlist component
import OrderDetail from "./pages/OrderDetail.jsx"; // Import OrderDetail component
import UserFavourites from "./pages/UserFavourites.jsx"; // Import UserFavourites component
import Cookshop from "./pages/Cookshop.jsx"; // Import Cookshop component
import AllUsers from "./components/AllUsers.jsx"; // Import AllUsers component

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

function AlertRenderer() {
  const { alert, dismissAlert, progress } = useAlert();

  if (!alert) return null;

  return (
    <div
      className={`alert alert-${alert.type}`}
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        backgroundColor: alert.type === "success" ? "#d4edda" : "#f8d7da",
        color: alert.type === "success" ? "#155724" : "#721c24",
      }}
    >
      <span>{alert.message}</span>
      <button
        style={{
          marginLeft: "10px",
          background: "none",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
        }}
        onClick={dismissAlert}
      >
        &times;
      </button>
      <div
        style={{
          height: "5px",
          background: "rgba(0, 0, 0, 0.2)",
          width: `${progress}%`,
          transition: "width 0.1s linear",
          marginTop: "5px",
        }}
      ></div>
    </div>
  );
}

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function App() {
  return (
    <AlertProvider>
      <Router>
        <Routes>
          {/* PUBLIC ROUTES - Accessible to everyone */}
          {/* Home, About, Auth */}
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
            path="/about"
            element={
              <>
                <Header pagename="About" />
                <About />
              </>
            }
          />
          <Route
            path="/signin"
            element={
              <>
                <Header pagename="Sign In" />
                <SignIn />
              </>
            }
          />
          <Route
            path="/signup"
            element={
              <>
                <Header pagename="Sign Up" />
                <SignUp />
              </>
            }
          />
          {/* PUBLIC - Recipes and Blogs */}
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
          {/* PUBLIC - Shop and Tags */}
          <Route
            path="/ingredient"
            element={
              <>
                <Header pagename="Ingredient" />
                <TagList tagType="ingredientTag" />
              </>
            }
          />
          <Route
            path="/cookshop"
            element={
              <>
                <Header pagename="Cookshop" />
                <Cookshop />
              </>
            }
          />
          <Route
            path="/cuisine"
            element={
              <>
                <Header pagename="Cuisine" />
                <TagList tagType="cuisineTag" />
              </>
            }
          />
          <Route
            path="/flavour"
            element={
              <>
                <Header pagename="Flavour" />
                <TagList tagType="flavourTag" />
              </>
            }
          />
          <Route
            path="/cookshop/:tagType/:id"
            element={<CookshopPageWrapper />}
          />
          {/* PUBLIC - Payment and Legal */}
          <Route
            path="/payment-failure"
            element={
              <>
                <Header pagename="Payment Failed" />
                <Failure />
              </>
            }
          />
          <Route
            path="/checkout"
            element={
              <>
                <Header pagename="Checkout" />
                <Checkout />
              </>
            }
          />
          {/* <Route
            path="/privacy-policy"
            element={
              <>
                <Header pagename="Privacy Policy" />
                <PrivacyPolicy />
              </>
            }
          /> */}
          <Route
            path="/terms-and-conditions"
            element={
              <>
                <Header pagename="Terms and Conditions" />
                <TermsAndConditions />
              </>
            }
          />
          <Route
            path="/payment-success"
            element={
              <>
                <Header pagename="Payment Success" />
                <PaymentSuccess />
              </>
            }
          />
          <Route
            path="/sitemap"
            element={
              <>
                <Header pagename="Site Map" />
                <SiteMap />
              </>
            }
          />{" "}
          <Route
            path="/faq"
            element={
              <>
                <Header pagename="FAQ" />
                <Faq />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <Header pagename="Contact Us" />
                <Contact />
              </>
            }
          />
          {/* USER AUTHENTICATED ROUTES - Requires login */}
          <Route element={<PrivateRoute />}>
            {/* User Profile */}
            <Route
              path="/profile"
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

            {/* User Content Creation */}
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

            {/* User Shopping */}
            <Route
              path="/user-favourites"
              element={
                <>
                  <Header pagename="My Favorites" />
                  <UserFavourites />
                </>
              }
            />
            <Route
              path="/orderlist"
              element={
                <>
                  <Header pagename="Order List" />
                  <Orderlist />
                </>
              }
            />
            <Route
              path="/orderdetail/:id"
              element={
                <>
                  <Header pagename="Order Detail" />
                  <OrderDetail />
                </>
              }
            />

            {/* ADMIN ROUTES */}
            <Route
              path="/admin/product/edit/:id"
              element={
                <>
                  <Header pagename="Edit Product" />
                  <ProductEdit />
                </>
              }
            />
            <Route
              path="/admin/users"
              element={
                <>
                  <Header pagename="Admin All Users" />
                  <AllUsers />
                </>
              }
            />
            <Route
              path="/admin/recipes"
              element={
                <>
                  <Header pagename="Admin All Recipes" />
                  <AdminAllRecipe />
                </>
              }
            />
            <Route
              path="/admin/tag/:tagType/:id"
              element={
                <>
                  <Header pagename="Admin Tag Details" />
                  <AdminTagDetail />
                </>
              }
            />
            <Route
              path="/admin/cookshop"
              element={
                <>
                  <Header pagename="Admin Cookshop" />
                  <AdminCookshop />
                </>
              }
            />
          </Route>
          {/* 404 Route */}
          <Route
            path="*"
            element={
              <>
                <Header pagename="404 Not Found" />
                <NotFound />
              </>
            }
          />
        </Routes>
        <Footer />
        <AlertRenderer />
      </Router>
    </AlertProvider>
  );
}
