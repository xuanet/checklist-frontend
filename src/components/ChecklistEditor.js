import './styles/ChecklistEditor.css';

import Category from './Category';
import { useState } from 'react';
import axios from 'axios'

function ChecklistEditor() {

  // Keep tracks of the current checklistId for updating or creating a new checklist entry
  const [checklistId, setChecklistId] = useState(1)

  // Stores the categories, files, and metadata for the current checklist
  const [categories, updateCategories] = useState([])

  // Stores the name of the new category being added
  const [newCatName, setNewCatName] = useState('');

  // Keeps track of id to assign to new categories to optimize rerendering
  const [nextId, setNextId] = useState(1);

  const handleNewCat = (e) => {
    setNewCatName(e.target.value)
  }

  const addCategory = () => {
    // Adds new category to current checklist

    if (newCatName.length === 0) {
      alert("Category name must be non-empty")
      return
    }
    updateCategories(prev => [...prev, { id: nextId, name: newCatName, files: [] }])
    setNextId(nextId+1)
    setNewCatName("")
  }

  const renameCategory = (idToRename) => {
    // Renames an existing category

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
    // Deletes category

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
    /* 
    Called to 1) update existing checklist or 2) create new checklist.

    First checks if checklistId is already in database through an API endpoint. If not, uses an API endpoint to extract the next available checklistId. Otherwise, sends the current checklistId so server knows to do update.

    Packages everything into FormData object.
    */

    let idToUse = checklistId;

    if (isNew) {
      // A new checklist requires the next unused checklistId
      const response = await axios.get("http://localhost:5000/get_next_available_id")
      idToUse = response.data
      setChecklistId(idToUse)
    }
  
    const formData = new FormData()
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
      alert('Upload failed');
    }
  };

  
const loadChecklist = async (id) => {
  /*
  Updates the state variable categories based on the response from the server after requesting for a specific checklistId. 
  */

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
};

const extractChecklist = async() => {
  /*
  Checks whether the desired checklist_id to be cloned exists before sending request
  */
  const response = await axios.get(`http://localhost:5000/get_all_checklists`)
  const validData = response.data
  const id = prompt(`Enter checklist Id to load. Available ids: ${validData}:`)
  if (validData.includes(parseInt(id))) {
    loadChecklist(parseInt(id))}
  else {
    alert('checklist Id does not exist')
  }
}

  return (
    <div className='App'>
      <strong className="checklist_id_display">{`Checklist Id: ${checklistId}`}</strong>
      {categories.map((category) => (
        <Category key={category.id} id={category.id} categoryName={category.name} savedFiles={category.files} renameFunc={renameCategory} deleteFunc={deleteCategory} updateChecklist={updateChecklist} />
      ))}
      <input className="rename_category" type="text" value={newCatName} placeholder="Enter new category name" onChange={handleNewCat}></input>
      <button className='add_category' onClick={addCategory}>Add category</button>
      <button className='save_new_checklist' onClick={() => saveChecklist(true)}>Save new checklist</button>
      <button className='update_existing_checklist' onClick={() => saveChecklist(false)}>Update existing checklist</button>
      <button className='clone_checklist' onClick={extractChecklist}>Load checklist</button>
    </div>
  );
}

export default ChecklistEditor;
