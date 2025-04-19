import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function PublicChecklistView() {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/clone_checklist/${id}`);
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
        console.error('Error fetching checklist:', err);
        alert('Could not load checklist');
      }
    };

    fetchChecklist();
  }, [id]);

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

  const saveNewFiles = async () => {
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
      alert('New files saved!');
    } catch (err) {
      console.error('Error saving files:', err);
      alert('Failed to save new files');
    }
  };

  return (
    <div className="public-checklist">
      <h2>Checklist #{id}</h2>
      {categories.map((cat) => (
        <div key={cat.id} className="category-block">
          <h3>{cat.name}</h3>

          <div>
            <strong>Existing files:</strong>
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

          <div>
            <input type="file" multiple onChange={(e) => handleFileChange(e, cat.id)} />
            <ul>
              {cat.addedFiles.map((f, idx) => (
                <li key={idx}>
                  {f.displayName}{' '}
                  <button onClick={() => renameFile(cat.id, idx)}>Rename</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
      <button onClick={saveNewFiles}>Submit New Files</button>
    </div>
  );
}
