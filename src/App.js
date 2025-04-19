import logo from './logo.svg';
import './App.css';

import Category from './components/Category';

function App() {
  return (
    <div className='App'>
      <Category categoryName={"my checklist"}></Category>
      <button className='clone_checklist'>Clone checklist</button>
      <button className='save checklist'>Save checklist</button>
    </div>
  );
}

export default App;
