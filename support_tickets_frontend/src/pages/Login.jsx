import {useState} from 'react'
import {useNavigate,Link} from 'react-router-dom'

function Login(){
   const [email,setEmail] = useState("")
   const [password,setPassword] = useState("")
   const [error,setError] = useState("")
   
   const navigate = useNavigate()
   
   const handleSubmit = async(event) =>{
       event.preventDefault()
       setError("")

       const formData = new URLSearchParams()

       formData.append('username',email)
       formData.append('password',password)

       try {
          console.log("url que voy a usar",'http://localhost:8000/auth/login')

          const response = await fetch('http://localhost:8000/auth/login',{
            method: 'POST',
            headers: {
                'Content-Type':'application/x-www-form-urlencoded',
            },
            body: formData
        })

        console.log("response",response)
        console.log("status",response.status)

        if (!response.ok){
            const errorData = await response.json()
            
            setError(errorData.detail || "Error al iniciar sesion")
            return
        }

        const data = await response.json()

        console.log("Login exitoso",data)

        localStorage.setItem('token',data.access_token)
        console.log("token recibido de login",data.access_token)

        navigate('/dashboard')

       } catch (error) {
          console.error("error completo",error)
          setError("No se puede conectar con el servidor")
       }
   }

    return(
        <div className="container mt-5" style={{maxWidth:'500px'}}>
              <h2>Iniciar Sesión</h2>
              {
                error && <div className='alert alert-danger'>
                    {error}
                </div>
              }

            <form onSubmit={handleSubmit}>
               <div className='mb-3'>
                 <label className='form-label'>
                    Email
                 </label>

                 <input
                    type="email"
                    className='form-control'
                    value={email}
                    onChange={(event)=>setEmail(event.target.value)}
                    required
                 />
                </div>    

                <div className='mb-3'>
                 <label className='form-label'>
                    Contraseña
                 </label>

                 <input
                    type="password"
                    className='form-control'
                    value={password}
                    onChange={(event)=>setPassword(event.target.value)}
                    required
                 />
                </div>    

                <button
                   type='submit'
                   className='btn btn-primary w-100'
                >
                   Iniciar Sesión
                </button>
            </form>

            <div className='mt-3 text-center'>
               <Link to='/register'>
                  Crear una cuenta
               </Link>
            </div>
        </div>
    )
}

export default Login