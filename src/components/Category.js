import React from 'react'
import { useState } from 'react'
import './styles/Category.css'
import axios from 'axios'

function Category({ id, categoryName, renameFunc, deleteFunc }) {

    // stores a potential new name
    const [name, changeName] = useState("")

    // executes renaming
    const handleNewName = (e) => {
      changeName(e.target.value)
    }

    // stores uploaded files
    const [files, setFiles] = useState([]);
  
    // updates files
    const handleFileUpload = (e) => {
      const selectedFiles = Array.from(e.target.files);
  
      // creates URL for files for display / download
      const withPreviewUrls = selectedFiles.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
  
      setFiles(prev => [...prev, ...withPreviewUrls]);
    };
  
    // delete specific file
    const handleDelete = (indexToRemove) => {
      // Revoke the object URL to clean up memory
      URL.revokeObjectURL(files[indexToRemove].previewUrl);
  
      setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // to be deleted
    const saveFiles = async () => {
      const formData = new FormData();

      files.forEach((item, index) => {
        formData.append('files', item.file); // Or use `files[]` depending on backend
      });
  
      try {
        const response = await axios('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) throw new Error('Upload failed');
  
        const data = await response.json();
        console.log('Upload success:', data);
        alert('Files uploaded successfully!');
      } catch (err) {
        console.error('Upload error:', err);
        alert('Upload failed');
      }
    }


  return (
    <div className='category_wrapper'>
        <button onClick={() => deleteFunc(id)}>Delete</button>
        <input type="text" value={name} onChange={handleNewName}></input>
        <button onClick={() => renameFunc(id, name)}>Rename</button>
        <p className='display'>{categoryName}</p>
        <input
        type="file"
        multiple
        accept=".txt,.xlsx,.pdf"
        onChange={handleFileUpload}
      />

      <ul>
        {files.map((item, index) => (
          <li key={index}>
            {/* Make file name clickable */}
            <a href={item.previewUrl} target="_blank" rel="noopener noreferrer">
              {item.file.name}
            </a>
            <button onClick={() => handleDelete(index)} style={{ marginLeft: '10px' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button onClick={saveFiles} disabled={files.length === 0}>Save</button>
        
    </div>
  )
}

export default Category