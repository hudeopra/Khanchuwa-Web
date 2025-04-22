import React, { useState } from "react";

const AccordionItem = ({ title, children }) => {
  // Set default state to true so content is open by default
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="kh-accordion">
      <div className="kh-accordion__head">
        <h3>{title}</h3>
        <span className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "▲" : "▼"}
        </span>
      </div>
      {isOpen && <div className="">{children}</div>}
    </div>
  );
};

export default AccordionItem;
