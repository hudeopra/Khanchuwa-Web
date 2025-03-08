import React, { useState } from "react";

const AccordionItem = ({ title, children }) => {
  // Set default state to true so content is open by default
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border rounded-lg mb-2">
      <div className="flex justify-between items-center p-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "▲" : "▼"}
        </span>
      </div>
      {isOpen && <div className="p-3">{children}</div>}
    </div>
  );
};

export default AccordionItem;
