import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FillPage() {
  const navigate = useNavigate();
  
  // States for application flow
  const [availableForms, setAvailableForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [selectedFormSchema, setSelectedFormSchema] = useState(null);
  
  const [file, setFile] = useState(null);
  const [isUploading, setIsLoading] = useState(false);
  const [extractedPayload, setExtractedPayload] = useState({});
  const [saveStatus, setSaveStatus] = useState('');

  // 1. Fetch available form templates on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/forms')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch forms');
        return res.json();
      })
      .then((data) => {
        setAvailableForms(data);
        if (data.length > 0) {
          // Auto-select first form if available
          setSelectedFormId(data[0].id);
          setSelectedFormSchema(data[0]);
        }
      })
      .catch((err) => console.error('Error loading form templates:', err));
  }, []);

  // Handle dropdown form changes
  const handleFormChange = (e) => {
    const id = e.target.value;
    setSelectedFormId(id);
    const schema = availableForms.find((f) => f.id === id);
    setSelectedFormSchema(schema || null);
    setExtractedPayload({}); // Clear previous results on template change
  };

  // Handle file picker selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'txt'];
      const fileExtension = selectedFile.name.slice(((selectedFile.name.lastIndexOf(".") - 1 >>> 0) + 2));
      
      if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
        alert('Unsupported file type. Please upload PDF, PNG, JPG, JPEG, or TXT.');
        e.target.value = null;
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    }
  };

  // 2. Upload document & invoke NIA AI Extraction engine
  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a document to upload first.');
      return;
    }
    if (!selectedFormSchema) {
      alert('Please select a target form template.');
      return;
    }

    setIsLoading(true);
    setSaveStatus('');

    // Step A: Append binary file data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('formId', selectedFormId);
    // Passing the actual schema layout structure so the backend knows what to map
    formData.append('schema', JSON.stringify(selectedFormSchema));

    try {
      // Step B: Send file payload to backend
      const response = await fetch('http://localhost:5000/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI Autofill Extraction pipeline failed.');
      }

      const result = await response.json();
      // Expecting standard structure: { field_id: { value: "Text", lowConfidence: true/false } }
      setExtractedPayload(result.extractedData || result);
    } catch (error) {
      console.error('Extraction Error:', error);
      alert('An error occurred during file parsing: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Inline modifications of autofilled data by the user
  const handleFieldUpdate = (fieldId, updatedValue) => {
    setExtractedPayload((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        value: updatedValue,
        lowConfidence: false, // Reset warnings once user touches/corrects the data
      },
    }));
  };

  // 3. Save finalized submission payload back to backend database
  const handleSaveSubmission = async () => {
    if (!selectedFormSchema) return;

    // Check for missing required structural data values
    const flattenedSubmission = {};
    let missingRequired = [];

    selectedFormSchema.fields.forEach((field) => {
      const userValue = extractedPayload[field.id]?.value || '';
      if (field.required && !userValue.trim()) {
        missingRequired.push(field.label);
      }
      flattenedSubmission[field.id] = userValue;
    });

    if (missingRequired.length > 0) {
      alert(`Error: Please fill in all required fields: ${missingRequired.join(', ')}`);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: selectedFormId,
          formTitle: selectedFormSchema.title,
          submittedData: flattenedSubmission,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSaveStatus('success');
        alert('Document submission saved successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post data values.');
      }
    } catch (err) {
      setSaveStatus('error');
      console.error('Submission save error:', err);
      alert('Error saving submission: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Header Shell */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Autofill Portal</h1>
            <p className="text-sm text-gray-500 mt-1">Upload files to autofill structured templates via the NIA Engine.</p>
          </div>
          <button 
            onClick={() => navigate('/user/builder')}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            ✏️ Manage Templates
          </button>
        </div>

        {/* Configurations & Upload Panel Setup */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Target Template Layout</label>
            <select 
              value={selectedFormId} 
              onChange={handleFormChange}
              className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-800 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {availableForms.length === 0 && <option>No forms found. Please build one first.</option>}
              {availableForms.map(f => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleDocumentSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Document Source</label>
            <div className="flex items-center space-x-4">
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <button
                type="submit"
                disabled={isUploading || !file}
                className={`px-5 py-2.5 text-sm font-medium rounded-md text-white shadow-sm transition-all whitespace-nowrap ${
                  isUploading || !file 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isUploading ? 'Analyzing File...' : '✨ Run Autofill'}
              </button>
            </div>
          </form>
        </div>

        {/* Smart Generated UI Form Review Box */}
        {selectedFormSchema && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3">
              Review: {selectedFormSchema.title}
            </h3>

            <div className="space-y-5">
              {selectedFormSchema.fields.map((field) => {
                const extractionContext = extractedPayload[field.id];
                const value = extractionContext?.value || '';
                const isLowConfidence = extractionContext?.lowConfidence;
                const isEmptyRequired = field.required && !value.trim();

                return (
                  <div key={field.id} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-gray-700">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      <div className="flex gap-2">
                        {isLowConfidence && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                            ⚠️ AI Low Confidence - Verify Entry
                          </span>
                        )}
                        {isEmptyRequired && (
                          <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                            ❗ Missing Required Field
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <input
                      type={field.type || 'text'}
                      value={value}
                      onChange={(e) => handleFieldUpdate(field.id, e.target.value)}
                      placeholder={field.required ? '(Required field)' : ''}
                      className={`w-full p-2.5 border rounded-md shadow-sm text-sm transition-all focus:outline-none focus:ring-2 ${
                        isEmptyRequired
                          ? 'border-rose-500 bg-rose-50 focus:ring-rose-500 focus:border-rose-500 text-rose-900'
                          : isLowConfidence
                          ? 'border-amber-400 bg-amber-50 focus:ring-amber-500 focus:border-amber-500 text-amber-900'
                          : 'border-gray-300 bg-white focus:ring-indigo-500 focus:border-indigo-500 text-gray-900'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Execution Buttons bar */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
              {saveStatus === 'success' && (
                <span className="text-sm font-semibold text-emerald-600">✓ Saved to system log database</span>
              )}
              <button
                type="button"
                onClick={handleSaveSubmission}
                className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-emerald-700 transition-colors"
              >
                💾 Finalize and Submit Data
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
