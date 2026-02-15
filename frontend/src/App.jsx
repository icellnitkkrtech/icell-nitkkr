import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from "./components/layout/Navbar";
import Footer from './components/layout/Footer';


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">

      {/* Fixed Navbar */}
      <div className="fixed top-6 w-full z-50 flex justify-center">
        <Navbar />
      </div>

      {/* Spacer for Fixed Navbar Height */}
      <div className="h-24"></div>

      {/* Main Content */}
      <main className="flex-1 px-8">
        <h1>Page Content</h1>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default App
