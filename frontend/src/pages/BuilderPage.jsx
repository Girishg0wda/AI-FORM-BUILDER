import { useState } from "react";

function BuilderPage() {
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

  const saveForm = () => {
    const invalidField = fields.find(
      (field) => field.label.trim() === ""
    );

    if (invalidField) {
      alert("Every field must have a label");
      return;
    }

    localStorage.setItem(
      "formSchema",
      JSON.stringify(fields)
    );

    alert("Form Saved Successfully");
  };

  const renderPreviewField = (field) => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            rows="3"
            style={{ width: "300px" }}
          />
        );

      case "number":
        return <input type="number" />;

      case "date":
        return <input type="date" />;

      case "dropdown":
        return (
          <select>
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
          <input type="checkbox" />
        );

      default:
        return <input type="text" />;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>
        Admin - Dynamic Form Builder
      </h1>

      <button
        onClick={addField}
        style={{
          padding: "8px 15px",
        }}
      >
        Add Field
      </button>

      <br />
      <br />

      {fields.map((field) => (
        <div
          key={field.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "6px",
          }}
        >
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
              marginRight: "10px",
            }}
          />

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
              marginRight: "10px",
            }}
          >
            <option value="text">
              Single Line Text
            </option>

            <option value="textarea">
              Multi Line Text
            </option>

            <option value="number">
              Number
            </option>

            <option value="date">
              Date
            </option>

            <option value="dropdown">
              Dropdown
            </option>

            <option value="checkbox">
              Checkbox
            </option>
          </select>

          <label
            style={{
              marginRight: "10px",
            }}
          >
            Required
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) =>
                updateField(
                  field.id,
                  "required",
                  e.target.checked
                )
              }
            />
          </label>

          <button
            onClick={() =>
              deleteField(field.id)
            }
          >
            Delete
          </button>

          {field.type === "dropdown" && (
            <div
              style={{
                marginTop: "10px",
              }}
            >
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
                  width: "300px",
                }}
              />
            </div>
          )}
        </div>
      ))}

      <button
        onClick={saveForm}
        style={{
          padding: "10px 20px",
        }}
      >
        Save Form
      </button>

      <hr />

      <h2>Live Preview</h2>

      {fields.length === 0 && (
        <p>
          No fields added yet.
        </p>
      )}

      {fields.map((field) => (
        <div
          key={field.id}
          style={{
            marginBottom: "15px",
          }}
        >
          <label>
            <strong>
              {field.label || "Untitled Field"}
            </strong>

            {field.required && (
              <span
                style={{
                  color: "red",
                }}
              >
                {" "}*
              </span>
            )}
          </label>

          <br />

          {renderPreviewField(field)}
        </div>
      ))}
    </div>
  );
}

export default BuilderPage;