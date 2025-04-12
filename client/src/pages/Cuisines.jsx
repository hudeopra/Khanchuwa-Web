import React, { useEffect, useState } from "react";
import TagList from "../components/TagList";

const Cuisines = () => {
  const [cuisines, setCuisines] = useState([]);

  useEffect(() => {
    const fetchCuisines = async () => {
      const response = await fetch("/api/cuisines");
      const data = await response.json();
      setCuisines(data);
    };

    fetchCuisines();
  }, []);

  return (
    <div>
      <h1>Cuisines</h1>
      <TagList tags={cuisines} />
    </div>
  );
};

export default Cuisines;
