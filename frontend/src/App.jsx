import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Navbar from "./components/layout/Navbar";
import { MemberProfilePage } from "./pages/MemberProfilePage";
export default function App() {
  return (
    // <BrowserRouter>
    //   <Navbar />

    //   <Routes>
    //     <Route path="/" element={<Home />} />
    //   </Routes>
    // </BrowserRouter>
  <MemberProfilePage/>
  );
}