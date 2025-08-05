import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmployeeCard from './components/EmployeeCard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EmployeeCard />} />
        <Route path="/:employeeId" element={<EmployeeCard />} />
      </Routes>
    </Router>
  );
}

export default App;