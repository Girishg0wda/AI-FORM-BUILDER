import { useEffect, useState } from "react";
import axios from "axios";

function FillPage() {
  const [schema, setSchema] = useState([]);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({});
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    const savedSchema = JSON.parse(
      localStorage.getItem("formSchema") || "[]"
    );

    setSchema(savedSchema);
  }, []);

  const uploadFile = async () => {
    if (schema.length === 0) {
      alert("Please create a form in Admin first");
      return;
    }

    if (!file) {
      alert("Please choose a file");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("file", file);

      const uploadRes = await axios.post(
        "http://127.0.0.1:8000/upload",
        fd
      );

      setResponseText(uploadRes.data.text);

      const extractRes = await axios.post(
        "http://127.0.0.1:8000/extract",
        {
          form_schema: schema,
          text: uploadRes.data.text,
        }
      );

      setFormData(extractRes.data);

      alert("AI Extraction Completed");
    } catch (error) {
      console.error(error);
      alert("Upload or Extraction Failed");
    }
  };

  const saveForm = () => {
    const missingRequired = schema.filter(
      (field) =>
        field.required &&
        (
          formData[field.label] === "" ||
          formData[field.label] === null ||
          formData[field.label] === undefined
        )
    );

    if (missingRequired.length > 0) {
      alert(
        `Please complete all required fields (${missingRequired.length} missing)`
      );
      return;
    }

    localStorage.setItem(
      "submission",
      JSON.stringify(formData)
    );

    alert("Form Saved Successfully");
  };

  const updateValue = (label, value) => {
    setFormData({
      ...formData,
      [label]: value,
    });
  };

  const renderField = (field) => {
    const value = formData[field.label] || "";

    const commonStyle = {
      width: "450px",
      padding: "10px",
      border:
        field.required && !value
          ? "2px solid red"
          : "1px solid #ccc",
      borderRadius: "4px",
    };

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            rows="4"
            value={value}
            style={commonStyle}
            onChange={(e) =>
              updateValue(
                field.label,
                e.target.value
              )
            }
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            style={commonStyle}
            onChange={(e) =>
              updateValue(
                field.label,
                e.target.value
              )
            }
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            style={commonStyle}
            onChange={(e) =>
              updateValue(
                field.label,
                e.target.value
              )
            }
          />
        );

      case "dropdown":
        return (
          <select
            value={value}
            style={commonStyle}
            onChange={(e) =>
              updateValue(
                field.label,
                e.target.value
              )
            }
          >
            <option value="">
              Select Option
            </option>

            {field.options
              ?.split(",")
              .filter(Boolean)
              .map((option, index) => (
                <option
                  key={index}
                  value={option.trim()}
                >
                  {option.trim()}
                </option>
              ))}
          </select>
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) =>
              updateValue(
                field.label,
                e.target.checked
              )
            }
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            style={commonStyle}
            onChange={(e) =>
              updateValue(
                field.label,
                e.target.value
              )
            }
          />
        );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>
        AI-Powered Form Builder &
        Document Autofill
      </h1>

      <hr />

      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      <button
        onClick={uploadFile}
        style={{
          marginLeft: "10px",
          padding: "8px 15px",
        }}
      >
        Upload & Autofill
      </button>

      <hr />

      <h3>Extracted Document Text</h3>

      <textarea
        rows="12"
        cols="120"
        value={responseText}
        readOnly
      />

      <hr />

      <h2>Review & Edit Form</h2>

      {schema.length === 0 ? (
        <p style={{ color: "red" }}>
          No form found.
          Please create a form in Admin.
        </p>
      ) : (
        schema.map((field) => (
          <div
            key={field.id}
            style={{
              marginBottom: "20px",
            }}
          >
            <label>
              <strong>
                {field.label}
              </strong>

              {field.required && (
                <span
                  style={{
                    color: "red",
                    marginLeft: "5px",
                  }}
                >
                  *
                </span>
              )}
            </label>

            <br />

            {renderField(field)}

            {field.required &&
              !formData[field.label] && (
                <div
                  style={{
                    color: "red",
                    fontSize: "12px",
                    marginTop: "5px",
                  }}
                >
                  Required field missing
                </div>
              )}
          </div>
        ))
      )}

      <button
        onClick={saveForm}
        style={{
          padding: "10px 20px",
        }}
      >
        Save Form
      </button>
    </div>
  );
}

export default FillPage;