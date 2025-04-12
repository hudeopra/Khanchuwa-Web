// import React, { useEffect, useState } from "react";
// import TagList from "../components/TagList";

// const AdminCookshop = () => {
//   const [ingredients, setIngredients] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchIngredients = async () => {
//       try {
//         const response = await fetch("/api/ingredients");
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         setIngredients(data);
//       } catch (err) {
//         setError(err.message);
//       }
//     };

//     fetchIngredients();
//   }, []);

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div>
//       <h1>AdminCookshop</h1>
//       <TagList tags={ingredients} tagType="ingredientTag" />
//     </div>
//   );
// };

// export default AdminCookshop;
