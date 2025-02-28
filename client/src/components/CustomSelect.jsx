import React, { useEffect, useRef } from "react";
// Import jQuery from local path
import "../../node_modules/jquery/dist/jquery.js";
const $ = window.jQuery;
// Import the Nice Select JS plugin (side effect)
import "../../node_modules/jquery-nice-select/js/jquery.nice-select.js";
// Import the CSS for Nice Select
import "../../node_modules/jquery-nice-select/css/nice-select.css";

const CustomSelect = (props) => {
  const selectRef = useRef(null);

  useEffect(() => {
    $(selectRef.current).niceSelect();
    return () => {
      $(selectRef.current).niceSelect("destroy");
    };
  }, []);

  return (
    <form>
      <div>
        <label>Dropdown:</label>
        <select ref={selectRef} name="dropdownInput">
          <option value="">Select an option</option>
          <option value="item1">Item 1</option>
          <option value="item2">Item 2</option>
          <option value="item3">Item 3</option>
        </select>
      </div>
    </form>
  );
};

export default CustomSelect;
