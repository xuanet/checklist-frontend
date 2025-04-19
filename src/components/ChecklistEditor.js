import './ChecklistEditor.css';

import Category from './Category';
import { useState } from 'react';
import axios from 'axios'

function ChecklistEditor() {

  const [checklistId, setChecklistId] = useState(-1)
  const [categories, updateCategories] = useState([])

  const [newCatName, setNewCatName] = useState('');
  const [nextId, setNextId] = useState(1);

  const handleNewCat = (e) => {
    setNewCatName(e.target.value)
  }

  const addCategory = () => {
    if (newCatName.length === 0) {
      alert("Category name must be non-empty")
      return
    }
    updateCategories(prev => [...prev, { id: nextId, name: newCatName, files: [] }])
    setNextId(nextId+1)
    setNewCatName("")
  }

  const renameCategory = (idToRename) => {
    const newName = window.prompt("Enter new name")
    if (newName.length === 0) {
      alert("Name must be non-empty")
      return
    }
    const currentCategories = [...categories]
    for (let i = 0; i<currentCategories.length; i++) {
      if (currentCategories[i].id === idToRename) {
        currentCategories[i].name = newName
        break
      }
    }
    updateCategories(currentCategories)
  }

  const deleteCategory = (idToDelete) => {
    updateCategories(prev => prev.filter(category => category.id !== idToDelete));
  }

  const updateChecklist = (idToUpdate, files) => {
    const currentCategories = [...categories]
    for (let i = 0; i<currentCategories.length; i++) {
      if (currentCategories[i].id === idToUpdate) {
        currentCategories[i].files = files
        break
      }
    }
    updateCategories(currentCategories)
  }



  const saveChecklist = async (isNew) => {
    let idToUse = checklistId;
  
    if (isNew) {
      const response = await axios.get("http://localhost:5000/get_next_available_id");
      idToUse = response.data;
      setChecklistId(idToUse); // still update React state for future use
    }
  
    const formData = new FormData();
    formData.append('checklistId', idToUse);
  
    categories.forEach((category, i) => {
      formData.append(`categories[${i}][name]`, category.name);
      category.files.forEach((file, j) => {
        formData.append(`categories[${i}][files][${j}]`, file.file);
      });
    });
  
    try {
      await axios.post('http://localhost:5000/save_checklist', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (isNew) {
        alert(`New checklist created with id ${idToUse}`);
      }
      else {
        alert(`Existing checklist id=${idToUse} updated`)
      }

    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    }
  

  };
const loadChecklist = async (id) => {

  
  try {
    const response = await axios.get(`http://localhost:5000/clone_checklist/${id}`);
    setChecklistId(id)
    const data = response.data;



    const rebuilt = data.map((cat, idx) => {
      const rebuiltFiles = cat.files.map(f => {
        const byteCharacters = atob(f.base64);
        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);
        const file = new File([blob], f.filename);
        return {
          file,
          previewUrl: URL.createObjectURL(file)
        };
      });

      return {
        id: idx + 1,
        name: cat.name,
        files: rebuiltFiles
      };
    });

    updateCategories(rebuilt);
    setNextId(rebuilt.length + 1);
  } catch (err) {
    console.error('Error loading checklist:', err);
    alert('Failed to load checklist');
  }
  console.log(categories)
};

  return (
    <div className='App'>
      {categories.map((category) => (
        <Category key={category.id} id={category.id} categoryName={category.name} savedFiles={category.files} renameFunc={renameCategory} deleteFunc={deleteCategory} updateChecklist={updateChecklist} />
      ))}
      <input type="text" value={newCatName} placeholder="Enter new category name" onChange={handleNewCat}></input>
      <button className='add_category' onClick={addCategory}>Add category</button>
      <button className='save checklist' onClick={() => saveChecklist(true)}>Save checklist</button>
      <button className='save checklist' onClick={() => saveChecklist(false)}>Save existing checklist</button>
      <button className='clone_checklist' onClick={async () => {
        const response = await axios.get(`http://localhost:5000/get_all_checklists`)
        const validData = response.data

  const id = prompt(`Enter checklist ID to clone ${validData}:`);
  if (validData.includes(parseInt(id))) {
    console.log("yes")
    loadChecklist(parseInt(id))}
    else {
      alert('checklist id does not exist')
      console.log("no")
    };
}}>
  Clone checklist
</button>
    </div>
  );
}

export default ChecklistEditor;
