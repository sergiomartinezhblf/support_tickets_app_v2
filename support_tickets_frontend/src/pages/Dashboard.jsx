import { useState,useEffect } from "react"
import {Link, useNavigate } from 'react-router-dom'


function Dashboard(){

    const [user,setUser] = useState(null)
    const [tickets,setTickets] = useState([])
    const [error,setError] = useState("")
    const [ticketsError,setTicketsError] = useState("")
    const [title,setTitle] = useState("")
    const [description,setDescription] = useState("")
    const [message,setMessage] = useState("")
    const [authError,setAuthError] = useState(false)

    const navigate = useNavigate()

    const handleLogout = ()=>{
        localStorage.removeItem('token')
        navigate('/login')
    }


    const handleCreateTicket = async(event) =>{
        event.preventDefault()
        setMessage("")
        setTicketsError("")

        const token = localStorage.getItem("token")

        try {
            const response = await fetch('http://localhost:8000/tickets/',
                {
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json',
                         Authorization: 'Bearer '+ token,
                    },
                    body: JSON.stringify({
                        title:title,
                        description:description
                    }),
                }
            )

            const data = await response.json()

            if(!response.ok){
                setTicketsError(
                    typeof data.detail==='string'? data.detail: "No se pudo crear el ticket"
                )
                return
            }
            setTickets((currentTickets)=>[...currentTickets,data])
            setTitle("")
            setDescription("")
            setMessage("Ticket creado correctamente")    
            
        } catch (error) {
            console.error("Error al crear el ticket:",error)
            setTicketsError("No se pudo conectar con el servidor")
        }
    }

    useEffect(()=>{
          if(authError){
            localStorage.removeItem('token')
            navigate('/login')
          }

    },[authError,navigate])

    useEffect(()=>{
        const loadDashboard = async ()=>{
            const token = localStorage.getItem('token')
 
           if(!token){
            setAuthError(true)
            return
           }        

           try {
             const  userResponse = await fetch('http://localhost:8000/auth/me',
                {
                    headers:{
                        Authorization: 'Bearer '+token,
                    },
                }
             )
             if (!userResponse.ok){
                setAuthError(true)
                return
             }
             const userData = await userResponse.json()
             setUser(userData)

            const ticketsResponse = await fetch('http://localhost:8000/tickets',
                {
                    headers:{
                        Authorization: 'Bearer '+token,
                    },
                }
            ) 

            if(!ticketsResponse.ok){
                setTicketsError("No se pudieron cargar los tickets")
                return
            }

            const ticketsData = await ticketsResponse.json()
            setTickets(ticketsData)
               
           } catch (error) {
              console.error("Error al cargar el dashbord",error)
              setError("No se pudo conectar con el servidor")
           } 
        }

        loadDashboard()

    },[])


    return(
        <div className="container mt-5">
             <h2>Dashboard</h2>

             {
                user?.is_admin&&(
                    <button className="btn btn-dark mb-3"
                    onClick={()=>navigate('/admin')}>
                      Panel administrativo
                    </button>
                )
             }

             <button
               type="button"
               className="btn btn-outline-danger mb-3"
               onClick={handleLogout}
             >
                 Cerrar Sesión
             </button>
             
             {
                error&&(
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )
             }

             {
                user&&(
                    <div className="alert alert-success">
                        <h5>Bienvenido {user.username}</h5>
                        <p className="mb-0">Email: {user.email}</p>
                    </div>
                )
             }

            <h3 className="mt-4 mb-3">Crear ticket</h3>

             {
                message&&(
                    <div className="alert alert-success">{message}</div>
                )
             }

            <form onSubmit={handleCreateTicket} className="mb-4">
                <div className="mb-3">
                   <label className="form-label">Titulo</label>
                   <input 
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(event)=>setTitle(event.target.value)}
                    required 
                    />
                </div>

                <div className="mb-3">
                   <label className="form-label">Descripción</label>
                   <input 
                    type="text"
                    className="form-control"
                    value={description}
                    onChange={(event)=>setDescription(event.target.value)}
                    required 
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Crear Ticket
                </button>
            </form> 

            <h3 className="mt-4 mb-3">Mis tickets</h3>

            {
                ticketsError&&(
                    <div className="alert alert-danger">{ticketsError}</div>
                )
            } 

            {
                !ticketsError&&tickets.length===0&&(
                    <p>Aun no tienes tickets registrados</p>
                )
            }

            {
                tickets.length>0&&(
                    <div className="list-group">
                        {
                            tickets.map((ticket)=>(
                                <Link
                                   key={ticket.id}
                                   to={`/tickets/${ticket.id}`}
                                   className="list-group-item list-group-item-action mb-2 text-decoration-none"
                            >
                                    <h5>{ticket.title}</h5>
                                    <p>{ticket.description}</p>

                                    <span
                                        className={`badge ${ticket.status === 'closed'? 'text-bg-secondary'  : 'text-bg-success'  }`}>
                                        {ticket.status}   
                                    </span>

                                    <p className="text-muted mt-2 mb-0">
                                        Ticket #{ticket.id}
                                    </p>

                                </Link>
                            ))
                        }
                    </div>
                )
            }
        </div>
    )
}

export default Dashboard