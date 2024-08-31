// src/components/MainPage.jsx
import React, { useState } from 'react';

const MainPage = () => {
  const [file, setFile] = useState(null); // State to hold the selected file
  const [uploadMessage, setUploadMessage] = useState(''); // State to hold upload status message

  // Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Handle form submission for file upload
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    if (!file) {
      setUploadMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('uploadFile', file); // Append the selected file to the FormData

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include credentials if needed
      });

      if (response.ok) {
        setUploadMessage('File uploaded successfully!');
      } else {
        const errorText = await response.text();
        setUploadMessage(`Upload failed: ${errorText}`);
      }
    } catch (error) {
      setUploadMessage('An error occurred during file upload.');
      console.error('Upload error:', error);
    }
  };

  return (
    <div>
      <h1>Main Page</h1>
      <form id="upload" onSubmit={handleSubmit} encType="multipart/form-data">
        <label id="drop_zone_label">Select or drop file below to upload</label>
        <div id="drop_zone">
          <input
            id="fileSelect"
            type="file"
            name="uploadFile"
            onChange={handleFileChange} // Handle file selection
          />
        </div>
        <input type="submit" value="Upload!" />
      </form>
      {uploadMessage && <p>{uploadMessage}</p>} {/* Display upload status message */}
    </div>
  );
};

export default MainPage;
