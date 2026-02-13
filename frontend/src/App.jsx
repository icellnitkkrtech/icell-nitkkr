import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from "./components/layout/Navbar";


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="min-h-screen bg-[#0d0d0d] text-white">
        <div className='fixed w-full mt-6'>
           <Navbar/>
        </div>
      
      {/* Page content */}
      <div className="p-8">
        <h1>Page Content</h1>
      </div>
    </div>
    </>
  )
}

export default App
