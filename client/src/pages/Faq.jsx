import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Faq = () => {
  const [openItem, setOpenItem] = useState(null);

  const toggleAccordion = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  // FAQ data structure
  const faqItems = [
    {
      question: "What is Khanchuwa?",
      answer:
        "Khanchuwa is a comprehensive food platform that combines recipe sharing, culinary blogging, and a specialized cookshop where you can purchase authentic ingredients for various cuisines. Our mission is to connect food lovers, home chefs, and culinary enthusiasts around the world through the shared passion of cooking and eating.",
    },
    {
      question: "How do I create an account?",
      answer:
        "Creating an account is easy! Click on the 'Sign Up' button in the top navigation menu or in the main menu. You can register using your email address and password, or use our convenient social login options with Google or Facebook for faster access.",
    },
    {
      question: "Is it free to use Khanchuwa?",
      answer:
        "Yes, creating an account and accessing most features on Khanchuwa is completely free. You can browse recipes, read blogs, and save your favorites without any cost. The only charges would be for purchasing ingredients or products from our Cookshop.",
    },
    {
      question: "How do I share my own recipe?",
      answer:
        "After signing in to your account, click on 'Add Recipe' in the main menu or navigate to your profile and select 'Create Recipe'. Our user-friendly recipe creation tool will guide you through adding ingredients, steps, photos, and all relevant details to showcase your culinary creation.",
    },
    {
      question: "Can I edit or delete recipes I've posted?",
      answer:
        "Absolutely! You maintain full control over your content. To manage your recipes, go to your profile and select 'My Recipes'. From there, you can edit details, update photos, or remove recipes you've previously shared.",
    },
    {
      question: "How do I save recipes I like?",
      answer:
        "When viewing any recipe, simply click the heart or 'Add to Favorites' button. All your saved recipes can be accessed through your profile under 'My Favorites'. This makes it easy to find and revisit dishes you want to cook again.",
    },
    {
      question: "What is the 'Random Recipe' feature?",
      answer:
        "The 'Random Recipe' feature is designed to inspire culinary creativity! When you click on it, you'll be taken to a randomly selected recipe from our extensive database. It's perfect for when you're looking for cooking inspiration or want to try something new.",
    },
    {
      question: "How does the Cookshop work?",
      answer:
        "Our Cookshop is a specialized marketplace for authentic cooking ingredients. You can browse products by cuisine, flavor profile, or ingredient type. After adding items to your cart, proceed to checkout, make a payment, and we'll deliver the products to your doorstep.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "Khanchuwa currently accepts credit/debit cards and eSewa payments. All transactions are processed securely through our encrypted payment gateways to ensure your financial information remains safe.",
    },
    {
      question: "How can I track my order?",
      answer:
        "After placing an order, you can track its status by going to your profile and selecting 'Order History'. Each order has detailed information including processing status, shipping details, and estimated delivery dates.",
    },
    {
      question: "Can I write blogs about food on Khanchuwa?",
      answer:
        "Yes! We encourage users to share their culinary knowledge and experiences. After signing in, click on 'Food Blog' in the main menu to create your blog post. You can include images, format text, and even link to recipes on our platform.",
    },
    {
      question: "How are recipes categorized on Khanchuwa?",
      answer:
        "Recipes on Khanchuwa are categorized by multiple facets: cuisine type (Nepalese, Italian, etc.), cooking method (grilled, baked, etc.), dietary needs (vegan, gluten-free, etc.), difficulty level, preparation time, and flavor profiles. This comprehensive tagging system makes finding the perfect recipe easy.",
    },
    {
      question: "What does the difficulty level on recipes mean?",
      answer:
        "Recipes are marked with difficulty levels from 'Beginner' to 'Advanced'. Beginner recipes require minimal cooking experience, while Advanced recipes might involve complex techniques or multiple components. This helps users select recipes that match their cooking expertise.",
    },
    {
      question: "How can I search for specific dietary requirements?",
      answer:
        "Use our advanced search filters to narrow down recipes that meet specific dietary needs. You can filter by vegetarian, vegan, gluten-free, dairy-free, and more. These filters can be combined with other criteria like cuisine type or preparation time for more precise results.",
    },
    {
      question: "Can I adjust recipe servings?",
      answer:
        "Yes! Most recipes on Khanchuwa include a serving size adjustment feature. Simply change the number of servings you want to prepare, and our system will automatically recalculate the ingredient quantities for you.",
    },
    {
      question: "How do I interact with other users?",
      answer:
        "You can interact with the Khanchuwa community by leaving comments and ratings on recipes and blogs. You can also follow your favorite content creators to stay updated on their latest posts. Our platform thrives on this collaborative exchange of culinary ideas and feedback.",
    },
    {
      question: "What is the 'What's New' section?",
      answer:
        "The 'What's New' section highlights recent updates to our platform, newly featured recipes, seasonal collections, and special promotions in the Cookshop. It's a great way to stay informed about the latest additions and improvements to the Khanchuwa experience.",
    },
    {
      question: "How can I contact Khanchuwa support?",
      answer:
        "For any questions, concerns, or feedback, you can reach our support team through the 'Contact Us' page. Fill out the contact form with your inquiry, and our team will respond as soon as possible. We aim to provide assistance within 24-48 hours.",
    },
    {
      question: "Are there mobile apps available for Khanchuwa?",
      answer:
        "Currently, Khanchuwa is optimized for mobile browsers, providing a seamless experience across all devices. We are actively developing dedicated mobile applications for iOS and Android, which will be announced on our 'What's New' section when available.",
    },
    {
      question: "How can I become a featured creator on Khanchuwa?",
      answer:
        "Featured creators are selected based on the quality and popularity of their contributions, engagement with the community, and uniqueness of their culinary perspective. Consistently sharing high-quality recipes and blogs increases your chances of being featured on our homepage and in curated collections.",
    },
  ];

  // Styles for the FAQ page
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
      marginBottom: "1.5rem",
      maxWidth: "800px",
      margin: "0 auto 2rem",
    },
    searchContainer: {
      maxWidth: "600px",
      margin: "0 auto 2rem",
      position: "relative",
    },
    searchInput: {
      width: "100%",
      padding: "1rem",
      fontSize: "1rem",
      border: "1px solid #ddd",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    faqList: {
      listStyle: "none",
      padding: "0",
      margin: "0",
    },
    faqItem: {
      marginBottom: "1rem",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    questionWrapper: {
      padding: "1.5rem",
      backgroundColor: "#f8f9fa",
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transition: "background-color 0.2s ease",
    },
    question: {
      margin: "0",
      fontSize: "1.2rem",
      color: "#333",
      fontWeight: "500",
    },
    answerWrapper: {
      padding: "0",
      maxHeight: "0",
      overflow: "hidden",
      transition: "all 0.3s ease-in-out",
    },
    answerOpen: {
      padding: "0 1.5rem 1.5rem",
      maxHeight: "500px",
    },
    answer: {
      margin: "0",
      fontSize: "1rem",
      lineHeight: "1.6",
      color: "#555",
    },
    iconButton: {
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      color: "#666",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
    categories: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "0.5rem",
      marginBottom: "2rem",
    },
    category: {
      padding: "0.5rem 1rem",
      backgroundColor: "#e9ecef",
      borderRadius: "20px",
      fontSize: "0.9rem",
      color: "#495057",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    activeCategory: {
      backgroundColor: "#2c7be5",
      color: "white",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Frequently Asked Questions</h1>
        <p style={styles.subtitle}>
          Find answers to the most common questions about using Khanchuwa. If
          you can't find what you're looking for, feel free to contact our
          support team.
        </p>
      </div>

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search for questions..."
          style={styles.searchInput}
        />
      </div>

      <ul style={styles.faqList}>
        {faqItems.map((item, index) => (
          <li key={index} style={styles.faqItem}>
            <div
              style={styles.questionWrapper}
              onClick={() => toggleAccordion(index)}
            >
              <h3 style={styles.question}>{item.question}</h3>
              <button style={styles.iconButton}>
                {openItem === index ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
            <div
              style={{
                ...styles.answerWrapper,
                ...(openItem === index ? styles.answerOpen : {}),
              }}
            >
              <p style={styles.answer}>{item.answer}</p>
            </div>
          </li>
        ))}
      </ul>

      <div style={styles.helpText}>
        <p>Can't find what you're looking for?</p>
        <p>
          Visit our{" "}
          <a
            href="/contact"
            style={{ color: "#2c7be5", textDecoration: "none" }}
          >
            Contact Page
          </a>{" "}
          or email us at support@khanchuwa.com
        </p>
      </div>
    </div>
  );
};

export default Faq;
