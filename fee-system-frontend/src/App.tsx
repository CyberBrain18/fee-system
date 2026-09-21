import { Routes, Route } from 'react-router-dom'
import Dashboard from './Dashboard'
import StudentDetail from './StudentDetail'
import RecordPayment from './RecordPayment'
import FeeRules from './FeeRules'

function App() {
  return (
    <Routes>
      <Route path="/fee-rules" element={<FeeRules />} />
      <Route path="/payments/new" element={<RecordPayment />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/students/:id" element={<StudentDetail />} />
    </Routes>
  )
}

export default App
