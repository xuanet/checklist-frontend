import './App.css';

import Category from './components/Category';
import { useState } from 'react';
import axios from 'axios'

function App() {

  const [files, setFiles] = useState([])
  const [categories, updateCategories] = useState([])

  const [newCatName, setNewCatName] = useState('');
  const [nextId, setNextId] = useState(1);

  const handleNewCat = (e) => {
    setNewCatName(e.target.value)
  }

  const addCategory = () => {
    updateCategories(prev => [...prev, { id: nextId, name: newCatName }])
    setNextId(nextId+1)
  }

  const renameCategory = (idToRename, newName) => {
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
  };
  const saveChecklist = () => {

  }
  
  return (
    <div className='App'>
      {categories.map((category) => (
        <Category key={category.id} id={category.id} categoryName={category.name} renameFunc={renameCategory} deleteFunc={deleteCategory} />
      ))}
      <input type="text" value={newCatName} onChange={handleNewCat}></input>
      <button className='add_category' onClick={addCategory}>Add category</button>
      <button className='clone_checklist'>Clone checklist</button>
      <button className='save checklist' onClick={saveChecklist}>Save checklist</button>
    </div>
  );
}

export default App;
