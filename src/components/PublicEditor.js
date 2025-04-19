import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './styles/PublicEditor.css'

export default function PublicChecklistView() {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/clone_checklist/${id}`);
        if (res.data === "out of range") {
          alert("No such checklist_id exists")
          return
        }
        const rebuilt = res.data.map((cat, index) => {
          const existingFiles = cat.files.map(f => {
            const byteCharacters = atob(f.base64);
            const byteNumbers = new Array(byteCharacters.length)
              .fill(0)
              .map((_, i) => byteCharacters.charCodeAt(i));
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray]);
            const url = URL.createObjectURL(blob);
            return {
              filename: f.filename,
              url,
            };
          });

          return {
            id: index + 1,
            name: cat.name,
            existingFiles,
            addedFiles: [],
          };
        });

        setCategories(rebuilt);
      } catch (err) {
        alert('Could not load checklist');
      }
    }

    fetchChecklist();
  }, [id])

  const handleFileChange = (e, catId) => {
    const files = Array.from(e.target.files);
    setCategories(prev =>
      prev.map(cat => {
        if (cat.id === catId) {
          const newAdded = files.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
            displayName: file.name,
          }));
          return { ...cat, addedFiles: [...cat.addedFiles, ...newAdded] };
        }
        return cat;
      })
    );
  };

  const renameFile = (catId, index) => {
    /* Only allows for newly added files to be renamed, existing files cannot be modified by user */

    const newName = prompt('Enter new file name:');
    if (newName && newName.length > 0) {
      setCategories(prev =>
        prev.map(cat => {
          if (cat.id === catId) {
            const updated = [...cat.addedFiles];
            updated[index].displayName = newName;
            return { ...cat, addedFiles: updated };
          }
          return cat;
        })
      );
    }
  };

  const removeFile = (catId, index) => {
    /* Only allows for newly added files to be removed, existing files cannot be modified by user */

    setCategories(prev =>
      prev.map(cat => {
        if (cat.id === catId) {
          const updated = [...cat.addedFiles];
          updated.splice(index, 1);
          return { ...cat, addedFiles: updated };
        }
        return cat;
      })
    );
  };
  
  const saveNewFiles = async () => {
    /* Updates the current checklist_id in the database with the new files (is any) */

    const formData = new FormData();
    formData.append('checklistId', id);
    categories.forEach((cat, i) => {
      formData.append(`categories[${i}][name]`, cat.name);
      cat.addedFiles.forEach((item, j) => {
        formData.append(`categories[${i}][files][${j}]`, item.file, item.displayName);
      });
    });

    try {
      await axios.post('http://localhost:5000/append_files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Checklist id ${id} updated`);
    } catch (err) {
      alert('Failed to save new files');
    }
  };

  return (
    <div className="public_checklist">
      <h1 className="header">Checklist id: {id}</h1>
      <div className="category_list">

      {categories.map((cat) => (
        <div key={cat.id} className="category_block">

          <h3>{`Category: ${cat.name}`}</h3>

          <p>Existing files:</p>
          <div>
            <ul>
              {cat.existingFiles.map((f, idx) => (
                <li key={idx}>
                  <a href={f.url} target="_blank" rel="noopener noreferrer">
                    {f.filename}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <p>Upload new files:</p>
          <div>
            <input type="file" multiple accept=".txt,.xlsx,.pdf" onChange={(e) => handleFileChange(e, cat.id)} />
            <ul>
              {cat.addedFiles.map((f, idx) => (
                <li key={idx}>
                  {f.displayName}{' '}
                  <div className="edit_file" >
                    <button onClick={() => renameFile(cat.id, idx)}>Rename</button>
                    <button onClick={() => removeFile(cat.id, idx)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
            <button className="submit_button" onClick={saveNewFiles}>Update checklist</button>
      </div>
    </div>
  );
}
