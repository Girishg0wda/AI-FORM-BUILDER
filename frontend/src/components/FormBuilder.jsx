import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPreview from "./FormPreview";

function FormBuilder() {
  const [fields, setFields] = useState([]);

  const navigate = useNavigate();

  const addField = () => {
    setFields([
      ...fields,
      {
        id: Date.now(),
        label: "",
        type: "text",
        required: false,
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

  const removeField = (id) => {
    setFields(
      fields.filter((field) => field.id !== id)
    );
  };

  const saveForm = () => {
    localStorage.setItem(
      "formSchema",
      JSON.stringify(fields)
    );

    alert("Form Saved");

    navigate("/fill");
  };

  return (
    <div>

      <button onClick={addField}>
        Add Field
      </button>

      <hr />

      {fields.map((field) => (
        <div
          key={field.id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px",
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
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="textarea">
              Text Area
            </option>
          </select>

          <label>
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
            onClick={() => removeField(field.id)}
          >
            Delete
          </button>
        </div>
      ))}

      <button onClick={saveForm}>
        Save Form
      </button>

      <hr />

      <FormPreview fields={fields} />
    </div>
  );
}

export default FormBuilder;