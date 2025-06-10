import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [msg, setMsg] = useState<string>('')

  useEffect(() => {
    axios.get(import.meta.env.BACKEND_API_URL + '/api/test')
      .then(res => setMsg(res.data.message))
      .catch(err => setMsg('Error connecting to backend: ' + err.message))
  }, [])

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Test connection to backend</h1>
      <p>{msg}</p>
    </div>
  )
}

export default App
