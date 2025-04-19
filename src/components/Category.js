import React from 'react'
import { useState } from 'react'
import './styles/Category.css'
import axios from 'axios'

function Category({ id, categoryName, savedFiles, renameFunc, deleteFunc, updateChecklist }) {

  
    // updates files
    const handleFileUpload = (e) => {
      const selectedFiles = Array.from(e.target.files);
  
      // creates URL for files for display / download
      const withPreviewUrls = selectedFiles.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
  
      // setFiles(prev => [...prev, ...withPreviewUrls]);
      const updatedFiles = [...savedFiles, ...withPreviewUrls]
      updateChecklist(id, updatedFiles)

    };
  
    // delete specific file
    const handleDelete = (indexToRemove) => {
      // Revoke the object URL to clean up memory
      URL.revokeObjectURL(savedFiles[indexToRemove].previewUrl);
      const updatedFiles = savedFiles.filter((_, index) => index !== indexToRemove)
      // setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
      updateChecklist(id, updatedFiles)

    };

    // to be deleted


    const renameFile = (index) => {
      const newFileName = window.prompt("Enter new file name")
      if (newFileName.length === 0) {
        alert("File name must be non-empty")
        return
      }
      const updatedFiles = [...savedFiles]
      alert(updatedFiles[index].file.name)
      const originalFile = updatedFiles[index].file
      updatedFiles[index].file = new File([originalFile], newFileName, {type: originalFile.type})
      alert(updatedFiles[index].file.name)
      updateChecklist(id, updatedFiles)


    }

  


  return (
    <div className='category_wrapper'>
        <button onClick={() => deleteFunc(id)}>Delete</button>
        <button onClick={() => renameFunc(id)}>Rename</button>
        <p className='display'>{categoryName}</p>
        <input
        type="file"
        multiple
        accept=".txt,.xlsx,.pdf"
        
        onChange={handleFileUpload}
      />

      <ul>
        {savedFiles.map((item, index) => (
          <li key={index}>
            {/* Make file name clickable */}
            <a href={item.previewUrl} target="_blank" rel="noopener noreferrer">
              {item.file.name}
            </a>
            <button onClick={() => handleDelete(index)} style={{ marginLeft: '10px' }}>
              Delete
            </button>
            <button onClick={() => renameFile(index)} style={{ marginLeft: '10px' }}>
              Rename
            </button>
          </li>
        ))}
      </ul>

      {/* <button onClick={saveFiles} disabled={files.length === 0}>Save</button> */}
        
    </div>
  )
}

export default Category