import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom"; // Import useParams
import PrivateRoute from "./components/PrivateRoute";
import { AlertProvider, useAlert } from "./components/AlertContext"; // Import useAlert

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
import PaymentSuccess from "./pages/PaymentSuccess";
import Checkout from "./pages/Checkout"; // Import Checkout component

import Failure from "./components/Failure";
// import Success from "./components/Success";
import Orderlist from "./pages/Orderlist"; // Import Orderlist component
import OrderDetail from "./pages/OrderDetail"; // Import OrderDetail component
import UserFavourites from "./pages/UserFavourites"; // Import UserFavourites component
import Cookshop from "./pages/Cookshop"; // Import Cookshop component
import AllUsers from "./components/AllUsers"; // Import AllUsers component

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
            <Route
              path="/user-favourites"
              element={
                <>
                  <Header pagename="My Favorites" />
                  <UserFavourites />
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

          {/* payment */}

          {/* <Route
            path="/paymentsuccess"
            element={
              <>
                <Header pagename="payment form" />
                <Success />
              </>
            }
          /> */}
          <Route
            path="/payment-failure"
            element={
              <>
                <Header pagename="payment form" />
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
            path="/adminallusers"
            element={
              <>
                <Header pagename="Admin All Users" />
                <AllUsers />
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
