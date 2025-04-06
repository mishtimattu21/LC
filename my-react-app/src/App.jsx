import './App.css'
import 'react'
import { useState } from 'react'
import Solutions from './components/Solutions'

function App() {
  const [showSolutions, setShowSolutions] = useState(false);

  return (
    <div className="App">
      {!showSolutions ? (
        <button onClick={() => setShowSolutions(true)}>Solutions</button>
      ) : (
        <div>
          <button onClick={() => setShowSolutions(false)} style={{ position: 'absolute', top: '10px', right: '10px' }}>Back</button>
          <Solutions />
        </div>
      )}
    </div>
  )
}

export default App
