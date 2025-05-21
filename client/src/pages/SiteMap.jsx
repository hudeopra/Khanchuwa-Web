import React, { useState } from "react";
import { Link } from "react-router-dom";

const SiteMap = () => {
  // State to track expanded nodes
  const [expanded, setExpanded] = useState({
    home: true,
    recipes: false,
    blogs: false,
    shop: false,
    user: false,
    admin: false,
    legal: false,
  });

  // Toggle expanded state
  const toggleExpand = (section) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // CSS styles for the sitemap
  const styles = {
    container: {
      padding: "2rem",
      maxWidth: "1200px",
      margin: "0 auto",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      marginBottom: "2rem",
      textAlign: "center",
    },
    title: {
      fontSize: "2.5rem",
      color: "#333",
      marginBottom: "1rem",
    },
    subtitle: {
      fontSize: "1.2rem",
      color: "#666",
      marginBottom: "2rem",
    },
    section: {
      marginBottom: "2rem",
      border: "1px solid #ddd",
      borderRadius: "8px",
      overflow: "hidden",
    },
    sectionHeader: {
      padding: "1rem",
      backgroundColor: "#f5f5f5",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
    },
    sectionTitle: {
      margin: "0",
      fontSize: "1.5rem",
      color: "#333",
    },
    sectionContent: {
      padding: expanded ? "1rem" : "0",
      maxHeight: expanded ? "1000px" : "0",
      overflow: "hidden",
      transition: "all 0.3s ease",
    },
    list: {
      listStyle: "none",
      padding: "0",
      margin: "0",
    },
    listItem: {
      padding: "0.7rem 1rem",
      borderBottom: "1px solid #eee",
    },
    link: {
      color: "#2c7be5",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
    },
    expandButton: {
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: "#666",
    },
    description: {
      fontSize: "0.9rem",
      color: "#777",
      marginTop: "0.5rem",
    },
    subList: {
      paddingLeft: "2rem",
      marginTop: "0.5rem",
    },
    badge: {
      display: "inline-block",
      padding: "0.25rem 0.5rem",
      marginLeft: "0.5rem",
      borderRadius: "4px",
      fontSize: "0.8rem",
      fontWeight: "bold",
    },
    adminBadge: {
      backgroundColor: "#dc3545",
      color: "white",
    },
    authBadge: {
      backgroundColor: "#ffc107",
      color: "black",
    },
    newBadge: {
      backgroundColor: "#28a745",
      color: "white",
    },
    icon: {
      marginRight: "0.5rem",
    },
    helpText: {
      textAlign: "center",
      margin: "2rem 0",
      padding: "1rem",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      fontSize: "1rem",
      color: "#666",
    },
  };

  // Helper function for rendering each section
  const renderSection = (title, key, pages, icon) => (
    <div className="sitemap-section" style={styles.section}>
      <div
        className="sitemap-section-header"
        style={styles.sectionHeader}
        onClick={() => toggleExpand(key)}
      >
        <h2 style={styles.sectionTitle}>
          <i className={icon} style={styles.icon}></i>
          {title}
        </h2>
        <button style={styles.expandButton}>{expanded[key] ? "−" : "+"}</button>
      </div>

      <div
        className="sitemap-section-content"
        style={{
          ...styles.sectionContent,
          padding: expanded[key] ? "1rem" : "0",
          maxHeight: expanded[key] ? "2000px" : "0",
        }}
      >
        <ul style={styles.list}>{pages}</ul>
      </div>
    </div>
  );

  // Helper function for rendering a link with description
  const renderLink = (
    path,
    title,
    description = "",
    badge = null,
    subItems = null
  ) => (
    <li style={styles.listItem}>
      <Link to={path} style={styles.link}>
        {title}
        {badge && (
          <span
            style={{
              ...styles.badge,
              ...(badge === "admin"
                ? styles.adminBadge
                : badge === "auth"
                ? styles.authBadge
                : badge === "new"
                ? styles.newBadge
                : {}),
            }}
          >
            {badge === "admin"
              ? "Admin"
              : badge === "auth"
              ? "Login Required"
              : badge === "new"
              ? "New"
              : badge}
          </span>
        )}
      </Link>
      {description && <p style={styles.description}>{description}</p>}
      {subItems && <ul style={styles.subList}>{subItems}</ul>}
    </li>
  );

  return (
    <div className="sitemap-container" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Khanchuwa Site Map</h1>
        <p style={styles.subtitle}>
          A complete guide to all pages and features available on our website
        </p>
      </header>

      {renderSection(
        "Home & General Pages",
        "home",
        <>
          {renderLink(
            "/",
            "Home Page",
            "Main landing page with featured recipes, categories, and flavor explorations"
          )}
          {renderLink(
            "/about",
            "About Us",
            "Learn about Khanchuwa's mission and vision"
          )}
          {renderLink("/signin", "Sign In", "Log in to your account")}
          {renderLink("/signup", "Sign Up", "Create a new account")}
        </>,
        "fas fa-home"
      )}

      {renderSection(
        "Recipes",
        "recipes",
        <>
          {renderLink(
            "/recipes",
            "Recipe List",
            "Browse all recipes with filtering options"
          )}
          {renderLink(
            "/recipes/:id",
            "Recipe Detail",
            "View complete recipe details, ingredients, and instructions"
          )}
          {renderLink("/search", "Search Results", "Find recipes by keyword")}
          {renderLink(
            "/create-recipe",
            "Create Recipe",
            "Share your own recipe with the community",
            "auth"
          )}
          {renderLink(
            "/user-recipe",
            "My Recipes",
            "Manage your submitted recipes",
            "auth"
          )}
          {renderLink(
            "/recipes/edit/:id",
            "Edit Recipe",
            "Update your existing recipe",
            "auth"
          )}
        </>,
        "fas fa-utensils"
      )}

      {renderSection(
        "Blogs",
        "blogs",
        <>
          {renderLink(
            "/blogs",
            "Blog List",
            "Browse all food-related articles"
          )}
          {renderLink("/blogs/:id", "Blog Detail", "Read complete blog posts")}
          {renderLink(
            "/create-blog",
            "Create Blog",
            "Share your culinary insights",
            "auth"
          )}
          {renderLink(
            "/user-blog",
            "My Blogs",
            "Manage your published blogs",
            "auth"
          )}
          {renderLink(
            "/blog/edit/:id",
            "Edit Blog",
            "Update your existing blog",
            "auth"
          )}
        </>,
        "fas fa-rss"
      )}

      {renderSection(
        "Cookshop & Tags",
        "shop",
        <>
          {renderLink(
            "/cookshop",
            "Cookshop",
            "Our marketplace for cooking ingredients"
          )}
          {renderLink(
            "/ingredient",
            "Ingredients",
            "Browse all available ingredients"
          )}
          {renderLink(
            "/cuisine",
            "Cuisines",
            "Explore recipes by cuisine type"
          )}
          {renderLink(
            "/flavour",
            "Flavours",
            "Discover recipes by flavor profile"
          )}
          {renderLink(
            "/checkout",
            "Checkout",
            "Complete your purchase",
            "auth"
          )}
          {renderLink(
            "/orderlist",
            "Order History",
            "View your previous orders",
            "auth"
          )}
          {renderLink(
            "/orderdetail/:id",
            "Order Detail",
            "Check specific order information",
            "auth"
          )}
        </>,
        "fas fa-shopping-cart"
      )}

      {renderSection(
        "User Account",
        "user",
        <>
          {renderLink(
            "/profile",
            "User Profile",
            "View your personal information",
            "auth"
          )}
          {renderLink(
            "/profile-edit",
            "Edit Profile",
            "Update your profile details",
            "auth"
          )}
          {renderLink(
            "/user-favourites",
            "My Favorites",
            "Access your saved recipes",
            "auth"
          )}
          {renderLink(
            "/payment-success",
            "Payment Success",
            "Confirmation after successful payment"
          )}
          {renderLink(
            "/payment-failure",
            "Payment Failed",
            "Information when payment cannot be processed"
          )}
        </>,
        "fas fa-user"
      )}

      {renderSection(
        "Admin Area",
        "admin",
        <>
          {renderLink(
            "/admin/users",
            "Manage Users",
            "View and manage all user accounts",
            "admin"
          )}
          {renderLink(
            "/admin/recipes",
            "Manage Recipes",
            "Review, approve, or reject recipes",
            "admin"
          )}
          {renderLink(
            "/admin/product/edit/:id",
            "Edit Product",
            "Update product information",
            "admin"
          )}
          {renderLink(
            "/admin/tag/:tagType/:id",
            "Tag Administration",
            "Manage tag details and connections",
            "admin"
          )}
        </>,
        "fas fa-lock"
      )}

      {renderSection(
        "Legal & Information",
        "legal",
        <>
          {renderLink(
            "/privacy-policy",
            "Privacy Policy",
            "Our data collection and usage policies"
          )}
          {renderLink(
            "/terms-and-conditions",
            "Terms and Conditions",
            "Rules and guidelines for using our site"
          )}
          {renderLink(
            "*",
            "404 Not Found",
            "Page shown when URL doesn't exist"
          )}
        </>,
        "fas fa-gavel"
      )}

      <div style={styles.helpText}>
        <p>
          <strong>Navigation Tips:</strong>
        </p>
        <p>
          Click on section headers to expand or collapse each category.
          <br />
          Items marked with{" "}
          <span style={{ ...styles.badge, ...styles.authBadge }}>
            Login Required
          </span>{" "}
          need an account access.
          <br />
          Items marked with{" "}
          <span style={{ ...styles.badge, ...styles.adminBadge }}>
            Admin
          </span>{" "}
          are restricted to administrators only.
        </p>
      </div>
    </div>
  );
};

export default SiteMap;
