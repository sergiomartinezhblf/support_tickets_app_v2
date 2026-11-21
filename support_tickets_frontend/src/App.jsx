import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TicketDetail from './pages/TicketDetail'
import Admin from './pages/Admin'

function App() {

  return (
    <BrowserRouter>
      <Routes>
         <Route path='/login' element={<Login/>}/>
         <Route path='/register' element={<Register/>}/>
         <Route path='/dashboard' element={<Dashboard/>}/>
         <Route path='/tickets/:ticketId' element={<TicketDetail/>}/>
         <Route path='/admin' element={<Admin/>}/> 
      </Routes>
    </BrowserRouter>
  )
}


export default App
