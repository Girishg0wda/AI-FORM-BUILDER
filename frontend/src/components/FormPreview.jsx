function FormPreview({ fields }) {
  return (
    <div>
      <h2>Live Preview</h2>

      {fields.map((field) => (
        <div key={field.id} style={{ marginBottom: "10px" }}>
          <label>
            {field.label || "Untitled Field"}

            {field.required && " *"}
          </label>

          <br />

          {field.type === "textarea" ? (
            <textarea />
          ) : (
            <input type={field.type} />
          )}
        </div>
      ))}
    </div>
  );
}

export default FormPreview;