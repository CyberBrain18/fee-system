import { Routes, Route } from 'react-router-dom'
import Dashboard from './Dashboard'
import StudentDetail from './StudentDetail'
import RecordPayment from './RecordPayment'
import FeeRules from './FeeRules'
import Login from './Login'
import RequireAuth from './RequireAuth'
import NoDuesCheck from './NoDuesCheck'
import CreateStudent from './CreateStudent'
import FeeComponentForm from './FeeComponentForm'

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
    </Routes>
  )
}

export default App
