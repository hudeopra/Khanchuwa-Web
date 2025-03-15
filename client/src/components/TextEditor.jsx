import React, { useRef } from "react";
import JoditEditor from "jodit-react";

const TextEditor = ({ value, onChange }) => {
  const editor = useRef(null);
  const config = {
    readonly: false,
    placeholder: "Enter rich text content...",
  };

  return (
    <JoditEditor
      ref={editor}
      value={value}
      config={config}
      tabIndex={1}
      onBlur={(newContent) => onChange(newContent)}
    />
  );
};

export default TextEditor;
