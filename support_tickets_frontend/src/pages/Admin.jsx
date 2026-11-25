import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom"

const API = import.meta.env.VITE_API_URL;

function Admin(){
    const navigate = useNavigate()

    const [users,setUsers] = useState([])
    const [error,setError] = useState("")
    const [loading,setLoading] = useState(true)
    const [currentUser,setCurrentUser] = useState(null)
    const [updatingUserId,setUpdatingUserId] = useState(null)
    const [successMessage,setSuccessMessage] = useState("")

    const handleRoleChange = async(userId,newRole)=>{
        const token = localStorage.getItem('token')

        setUpdatingUserId(userId)
        setError("")
        setSuccessMessage("")

        try {
            const response = await fetch(`${API}/auth/admin/users/${userId}/role`,{
                method:'PATCH',
                headers:{
                    'Content-Type':'application/json',
                    Authorization:'Bearer ' + token,
                },
                body: JSON.stringify({is_admin: newRole,}),
            })

            if(!response.ok){
                const data= await response.json()
                setError(data.detail||'No se pudo actualizar el rol')
                return
            }

            const updatedUser = await response.json()

            setUsers((currentUsers)=>currentUsers.map((user)=>user.id==updatedUser.id?updatedUser:user))
            setSuccessMessage("Rol actualizado correctamente")
        } catch (error) {
            console.error('Error al actualizar el rol',error)
            setError('No se pudo conectar con el servidor')
        } finally{
            setUpdatingUserId(null)
        }
    }

    useEffect(()=>{
        const loadUsers = async()=>{
            const token = localStorage.getItem('token')

            if(!token){
                localStorage.removeItem('token')
                navigate('/login')
                return
            }

            try {
                //Comprobamos quien esta conectado
                const userResponse = await fetch(`${API}/auth/me`,{
                    headers:{
                        Authorization:'Bearer ' + token,
                    },
                })

                if(userResponse.status===401){
                    localStorage.removeItem('token')
                    navigate('/login')
                    return
                }

                if(!userResponse.ok){
                    setError("No se pudo verificar el usuario")
                    return
                }

                const userData = await userResponse.json()
                setCurrentUser(userData)

                //Comprobamos que sea administrador
                if(!userData.is_admin){
                    navigate('/dashboard')
                    return
                }

                //Consultamos todos los usuarios
                const response = await fetch(`${API}/auth/admin/users`,{
                    headers:{
                        Authorization: 'Bearer ' + token,
                    },
                })

                if (response.status===401){
                    localStorage.removeItem('token')
                    navigate('/login')
                    return
                }

                if(!response.ok){
                    setError("No se pudiero cargar los usuarios")
                    return
                }

                const data = await response.json()
                setUsers(data)
                
            } catch (error) {
                console.error("Error al cargar los usuarios:",error)
                setError("No se pudo conectar con el servidor")
            } finally{
                setLoading(false)
            }
        }
        loadUsers()
    },[navigate])

    return(
        <div className="container mt-5">
            <h2>Panel Administrativo</h2>
            <p>Administración de usuarios</p>
            <button
              className="btn btn-outline-secondary mb-4"
              onClick={()=>navigate('/dashboard')}            
            >
                Volver al Dashboard
            </button>

            {successMessage && (
                <div className="alert alert-success">
                      {successMessage}
                </div>
            )}

            {loading && <p>Cargando usuarios...</p>}

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {
                !loading && !error && (
                    <>
                       <h4>Usuarios registrados: {users.length}</h4>

                       <div className="table-responsive mt-3">
                          <table className="table table-striped table-bordered">
                              <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Usuario</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Acciones</th>
                                </tr>   
                              </thead>  
                              <tbody>
                                {users.map((user)=>(
                                    <tr key={user.id}>
                                       <td>{user.id}</td> 
                                       <td>{user.username}</td>
                                       <td>{user.email}</td>
                                       <td>{ user.is_admin?'Administrador':'Usuario'
                                        }</td>
                                        <td>
                                            <button
                                              className="btn btn-sm btn-outline-primary"
                                              disabled={user.id===currentUser?.id || updatingUserId===user.id}
                                              onClick={()=>handleRoleChange(user.id,!user.is_admin)}
                                            >
                                                {updatingUserId===user.id?'Actualizando...':user.is_admin?'Quitar administrador':'Hacer administrador'}
                                            </button>
                                        </td>
                                    </tr>    
                                ))}
                              </tbody>                
                          </table>
                       </div>

                    </>
                )
            }
        </div>
    )
}

export default Admin