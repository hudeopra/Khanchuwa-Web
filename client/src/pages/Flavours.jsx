import React, { useEffect, useState } from "react";
import TagList from "../components/TagList";

const Flavours = () => {
  const [flavors, setFlavors] = useState([]);

  useEffect(() => {
    const fetchFlavors = async () => {
      const response = await fetch("/api/flavors");
      const data = await response.json();
      setFlavors(data);
    };

    fetchFlavors();
  }, []);

  return (
    <div>
      <h1>Flavours</h1>
      <TagList tags={flavors} />
    </div>
  );
};

export default Flavours;
