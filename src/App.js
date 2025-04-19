import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicEditor from './components/PublicEditor';
import ChecklistEditor from './components/ChecklistEditor';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChecklistEditor />} />
        <Route path="/view/:id" element={<PublicEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
