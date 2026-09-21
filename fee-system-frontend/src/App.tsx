import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import StudentDetail from './pages/StudentDetail'
import RecordPayment from './pages/RecordPayment'
import FeeRules from './pages/FeeRules'
import Login from './pages/Login'
import RequireAuth from './lib/RequireAuth'
import NoDuesCheck from './pages/NoDuesCheck'
import CreateStudent from './pages/CreateStudent'
import FeeComponentForm from './pages/FeeComponentForm'
import FeeRuleForm from './pages/FeeRuleForm'
import AssignFee from './pages/AssignFees'
import BulkCreateStudents from './pages/BulkCreateStudents'
import WithdrawnStudents from './pages/WithdrawnStudents'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/students/:id" element={<RequireAuth><StudentDetail /></RequireAuth>} />
      <Route path="/payments/new" element={<RequireAuth><RecordPayment /></RequireAuth>} />
      <Route path="/fee-rules" element={<RequireAuth><FeeRules /></RequireAuth>} />
      <Route path="/no-dues" element={<RequireAuth><NoDuesCheck /></RequireAuth>} />
      <Route path="/students/new" element={<RequireAuth><CreateStudent /></RequireAuth>} />
      <Route path="/fee-components/new" element={<RequireAuth><FeeComponentForm /></RequireAuth>} />
      <Route path="/fee-rules/new" element={<RequireAuth><FeeRuleForm /></RequireAuth>} />
      <Route path="/students/:id/assign-fee" element={<RequireAuth><AssignFee /></RequireAuth>} />
      <Route path="/students/bulk-import" element={<RequireAuth><BulkCreateStudents /></RequireAuth>} />
      <Route path="/students/withdrawn" element={<RequireAuth><WithdrawnStudents /></RequireAuth>} />
    </Routes>
  )
}

export default App
