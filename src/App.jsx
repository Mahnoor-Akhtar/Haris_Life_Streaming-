import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Room from './pages/Room'
import MeetUI from './pages/MeetUI'

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/room/:roomId' element={<Room />} />
      <Route path='/demo' element={<MeetUI />} />
    </Routes>
  )
}
