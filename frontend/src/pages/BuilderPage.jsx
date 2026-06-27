import { useState } from "react";

function BuilderPage() {
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState([]);

  const addField = () => {
    setFields([
      ...fields,
      {
        id: Date.now(),
        label: "",
        type: "text",
        required: false,
        options: "",
      },
    ]);
  };

  const updateField = (id, key, value) => {
    setFields(
      fields.map((field) =>
        field.id === id
          ? { ...field, [key]: value }
          : field
      )
    );
  };

  const deleteField = (id) => {
    setFields(
      fields.filter((field) => field.id !== id)
    );
  };

  const saveForm = async () => {
    if (!title.trim()) {
      alert("Please provide a title for your form");
      return;
    }

    const invalidField = fields.find(
      (field) => field.label.trim() === ""
    );

    if (invalidField) {
      alert("Every field must have a label");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          fields: fields,
        }),
      });

      if (response.ok) {
        alert("Form Saved Successfully");
      } else {
        const errorData = await response.json();
        alert("Failed to save form: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving form:", error);
      alert("An error occurred while saving the form.");
    }
  };

  const renderPreviewField = (field) => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            rows="3"
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        );

      case "number":
        return <input type="number" style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />;

      case "date":
        return <input type="date" style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />;

      case "dropdown":
        return (
          <select style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
            <option>
              Select Option
            </option>

            {field.options
              .split(",")
              .filter(Boolean)
              .map((option, index) => (
                <option key={index}>
                  {option.trim()}
                </option>
              ))}
          </select>
        );

      case "checkbox":
        return (
          <input type="checkbox" style={{ width: "20px", height: "20px" }} />
        );

      default:
        return <input type="text" style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />;
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif", color: "#333" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "24px", fontWeight: "bold" }}>
        Admin - Dynamic Form Builder
      </h1>

      <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px solid #eee" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Form Title</label>
        <input
          type="text"
          placeholder="e.g., Job Application Form"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            boxSizing: "border-box"
          }}
        />
      </div>

      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Fields Configuration</h2>
        <button
          onClick={addField}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          + Add Field
        </button>
      </div>

      {fields.map((field) => (
        <div
          key={field.id}
          style={{
            border: "1px solid #e5e7eb",
            padding: "20px",
            marginBottom: "16px",
            borderRadius: "8px",
            backgroundColor: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}
        >
          <div style={{ display: "flex", gap: "15px", marginBottom: "15px", flexWrap: "wrap" }}>
            <div style={{ flex: "1", minWidth: "200px" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "4px" }}>Field Label</label>
              <input
                placeholder="Field Label"
                value={field.label}
                onChange={(e) =>
                  updateField(
                    field.id,
                    "label",
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ width: "180px" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "4px" }}>Type</label>
              <select
                value={field.type}
                onChange={(e) =>
                  updateField(
                    field.id,
                    "type",
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box"
                }}
              >
                <option value="text">Single Line Text</option>
                <option value="textarea">Multi Line Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="dropdown">Dropdown</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", marginTop: "24px" }}>
              <input
                type="checkbox"
                id={`req-${field.id}`}
                checked={field.required}
                onChange={(e) =>
                  updateField(
                    field.id,
                    "required",
                    e.target.checked
                  )
                }
                style={{ marginRight: "8px" }}
              />
              <label htmlFor={`req-${field.id}`} style={{ fontSize: "0.875rem", fontWeight: "500", cursor: "pointer" }}>
                Required
              </label>
            </div>

            <button
              onClick={() =>
                deleteField(field.id)
              }
              style={{
                alignSelf: "flex-end",
                padding: "8px 12px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Delete
            </button>
          </div>

          {field.type === "dropdown" && (
            <div style={{ marginTop: "10px" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "4px" }}>Options (comma separated)</label>
              <input
                placeholder="Option1, Option2, Option3"
                value={field.options}
                onChange={(e) =>
                  updateField(
                    field.id,
                    "options",
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box"
                }}
              />
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "2px solid #eee", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={saveForm}
          style={{
            padding: "12px 30px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "600"
          }}
        >
          Save Form Template
        </button>
      </div>

      <hr style={{ margin: "50px 0", border: "0", borderTop: "1px solid #eee" }} />

      <h2 style={{ fontSize: "1.5rem", marginBottom: "24px", fontWeight: "bold" }}>Live Preview</h2>

      <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", border: "1px solid #eee", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: "1.25rem", marginBottom: "20px", color: "#111" }}>
          {title || "Untitled Form"}
        </h3>

        {fields.length === 0 && (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            No fields added yet. Start building your form above!
          </p>
        )}

        {fields.map((field) => (
          <div
            key={field.id}
            style={{
              marginBottom: "20px"
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "0.9rem",
                color: "#374151"
              }}
            >
              {field.label || "Untitled Field"}
              {field.required && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>}
            </label>

            <div style={{ maxWidth: "100%" }}>
              {renderPreviewField(field)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BuilderPage;