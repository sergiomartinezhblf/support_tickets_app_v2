import {useState,useEffect} from 'react'
import {useParams,Link,useNavigate } from 'react-router-dom'

function TicketDetail(){
    const {ticketId} = useParams()

    const [notes,setNotes] = useState([])
    const [error,setError] = useState("")
    const [loading,setLoading] = useState(true)
    const [content,setContent] = useState("")
    const [message,setMessage] = useState("")
    const [saving,setSaving] = useState(false)
    const [ticket,setTicket] = useState([])
    const [authError,setAuthError] = useState(false)

    const navigate = useNavigate()

    useEffect(()=>{
        if(authError){
            localStorage.removeItem('token')
            navigate('/login')
        }
    },[authError,navigate])


    useEffect(()=>{
         const getNotes = async()=>{
            const token = localStorage.getItem('token')

            if(!token){
                setAuthError(true)
                setLoading(false)
                return
            }

            try {
                const response = await fetch(`http://localhost:8000/tickets/${ticketId}/notes`,
                    {
                        headers:{
                            Authorization: 'Bearer '+ token,
                        },
                    }
                )

                const data = await response.json()

                if(!response.ok){
                    setError(
                        typeof data.detail==='string'? data.detail : "No se pudieron cargar las notas"
                    )
                    return
                }

                setNotes(data)
            } catch (error) {
                console.error("Error al consultar las notas: ",error)
                setError("No se pudo conectar con el servidor")
            } finally{
                setLoading(false)
            }
         }

         getNotes()
    },[ticketId])

    useEffect(()=>{
        const getTicket = async ()=>{
            const token = localStorage.getItem('token')
            
            try {
                const response = await fetch(`http://localhost:8000/tickets/${ticketId}`,{
                    headers: {
                        Authorization: 'Bearer ' + token,
                    },
                }
               )

               const data = await response.json()

               if(response.status===401){
                  setAuthError(true)
               }

               if(!response.ok){
                setError(
                    typeof data.detail === 'string'? data.detail : "No se pudo cargar el ticket"
                )
                return
               }

               setTicket(data)

            } catch (error) {
                console.error("Error al consultar el ticket:",error)
                setError("No se pudo conectar con el servidor")
            }
        }
        getTicket()
    },[ticketId])

    const handleCreateNote = async(event)=>{
        event.preventDefault()

        if(!content.trim()){
            setError("Escribe el contenido de la nota")
            return
        }

        const token = localStorage.getItem("token")

        setSaving(true)
        setError("")
        setMessage("")

        try {
            const response = await fetch(`http://localhost:8000/tickets/${ticketId}/notes`,
                {
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json',
                        Authorization:'Bearer '+ token,
                    },
                    body: JSON.stringify({
                        content:content,
                    })
                }
            )

            const data = await response.json()

            if(!response.ok){
                setError(
                    typeof data.detail==='string'? data.detail : "No se pudo crear la nota"
                )
                return
            }

            setNotes((currentNotes)=>[...currentNotes,data])
            setContent("")
            setMessage("Nota creada exitosamente")
        } catch (error) {
            console.error("Error al crear la nota",error)
            setError("No se pudo conectar al servidor")
        }finally{
            setSaving(false)
        }
    }

    const handleCloseTicket = async() =>{
        const token = localStorage.getItem('token')

        setError("")
        setMessage("")

        try {
            const response = await fetch(`http://localhost:8000/tickets/${ticketId}/close`,
                {
                    method: 'PATCH',
                    headers:{
                        Authorization:'Bearer ' + token,
                    },
                }
            )

            const data = await response.json()

            if(!response.ok){
                setError(
                    typeof data.detail=== 'string'? data.detail : "No se pudo cerrar el ticket"
                )
                return
            }

            setMessage("Ticket cerrado correctamente")
            setTicket((currentTicket)=>({...currentTicket,status:'closed'}))

        } catch (error) {
            console.error("Error al cerrar el ticket",error)
            setError("No se pudo conectar con el servidor")
        }
    }

    return (
        <div className='container mt-5'>
             <Link to="/dashboard" className="btn btn-outline-secondary mb-4">
                Volver al dashboard
             </Link>

             <h2>Notas del ticket # {ticketId}</h2>

             {
                ticket&&(
                    <div className='card mb-4'>
                        <div className='card-body'>
                            <h2>{ticket.title}</h2>

                            <p>{ticket.description}</p>
                            <p>                            <strong>Estado:</strong>
                            <span className={`badge ${ticket.status==='closed'?'text-bg-secondary':'text-bg-success'}`}>
                                  {ticket.status==='closed'?'Cerrado':'Abierto'}               
                            </span>
                            </p>
                            
                            <small className='text-muted'>Ticket #{ticketId}</small>
                        </div>
                    </div>
                )
             }

             <form onSubmit={handleCreateNote} className='mt-4 mb-4'>
                <div className='mb-3'>
                   <label htmlFor='content' className='form-label'>
                    Nota nueva
                   </label>
                   <textarea 
                     id="content" 
                    className='form-control' 
                    rows="3" 
                    value={content}
                    onChange={(event)=>setContent(event.target.value)}
                    placeholder='Escribe una nota para este ticket...'
                    disabled={ticket?.status==='closed'}/>
                </div>
                <button
                  type='submit'
                  className='btn btn-primary'
                  disabled={saving || ticket?.status==='closed'}
                >
                    {saving? 'Guardando...':'Agregar nota'}
                </button>
             </form>

             { ticket?.status==='open'&&(
             <button
             type='button'
             className='btn btn-danger mb-3'
             onClick={handleCloseTicket}>
                   Cerrar Ticket
             </button>
             )}

             {
                message&&(
                    <div className='alert alert-success'>
                        {message}
                    </div>
                )
             }

             {loading&&<p>Cargando notas...</p>}

             {error&&(
                <div className='alert alert-danger'>{error}</div>
             )}

             {!loading&&!error&&notes.length===0&&(
                <p>Este ticket todavia no tiene notas</p>
             )}

             {
                notes.length>0&&(
                    <div className='list-group mt-3'>
                       {
                        notes.map((note)=>(
                            <div key={note.id} className='list-group-item'>
                               <p className='mb-1'>{note.content}</p>
                               <small className='text-muted'>Nota #{note.id}</small>
                            </div>
                        ))
                       }
                    </div>
                )
             }
        </div>
    )
}

export default TicketDetail