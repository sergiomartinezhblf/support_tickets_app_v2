import { useState } from "react"
import {Link} from 'react-router-dom'

function Register(){
    const [username,setUsername] = useState("")
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [error,setError] = useState("")
    const [success,setSuccess] = useState("")

    const handleSubmit = async(event) =>{
        event.preventDefault()

        setError("")
        setSuccess("")

        try{
            const response = await fetch('http://localhost:8000/auth/register',
                {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password
                    }),
                }
            )
            const data = await response.json()

            if (!response.ok){
                setError(
                    typeof data.detail === "string"
                    ?data.detail
                    :'No se pudo crear la cuenta'
                )
            return    
        }

        setSuccess('Cuenta creada correctamente.Ya puedes iniciar sesion')
        setUsername("")
        setEmail("")
        setPassword("")
        } catch(error){
            console.error("Error al registrar",error)
            setError("No se pudo conectar con el servidor")
        }
    } 
    

    return (
        <div className="container mt-5" style={{maxWidth:'500px'}}>
            <h2 className="mb-4">Crear Cuenta</h2>
            
            {
                error&&(
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )
            }

            {
                success&&(
                    <div className="alert alert-success">
                         {success}
                    </div>
                )
            }

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                   <label className="form-label">Nombre</label>
                   <input type="text"
                          className="form-control"
                          value={username}
                          onChange={(event)=>setUsername(event.target.value)}
                          required />
                </div>
                <div className="mb-3">
                   <label className="form-label">Email</label>
                   <input type="email"
                          className="form-control"
                          value={email}
                          onChange={(event)=>setEmail(event.target.value)}
                          required />
                </div>
                <div className="mb-3">
                   <label className="form-label">Contraseña</label>
                   <input type="password"
                          className="form-control"
                          value={password}
                          onChange={(event)=>setPassword(event.target.value)}
                          required />
                </div>

                <button type="submit" className="btn btn-primary w-100">Registrarme</button>

            </form>

            <div className="mt-3 text-center">
                 <Link to="/login">Ya tengo una cuenta</Link>
            </div>
        </div>
    )
}

export default Register