import React from 'react'
import {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
let[input,setInput]=useState('')  
let[userName, setUserName] = useState('')
let[lastRoomId, setLastRoomId] = useState('')
let navigate=useNavigate()

function randomRoomId(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = ''
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}

function HandleJoin()
{
  const name = userName.trim()
  if (!name) {
    alert('Please enter your name')
    return
  }
  const roomId = input.trim()
  if (!roomId) return
  localStorage.setItem('live:userName', name)
  localStorage.setItem('live:lastRoomId', roomId)
  navigate(`/room/${encodeURIComponent(roomId)}`)
}

function handleCreateRoom() {
  const name = userName.trim()
  if (!name) {
    alert('Please enter your name')
    return
  }
  const newRoomId = randomRoomId()
  setInput(newRoomId)
  localStorage.setItem('live:userName', name)
  localStorage.setItem('live:lastRoomId', newRoomId)
  navigate(`/room/${encodeURIComponent(newRoomId)}`)
}

useEffect(() => {
  const recentRoom = localStorage.getItem('live:lastRoomId') || ''
  const savedName = localStorage.getItem('live:userName') || ''
  if (!recentRoom) return
  setLastRoomId(recentRoom)
  if (!input) {
    setInput(recentRoom)
  }
  if (savedName) {
    setUserName(savedName)
  }
}, [])

function handleRejoinLastRoom() {
  const name = userName.trim()
  if (!name) {
    alert('Please enter your name')
    return
  }
  if (!lastRoomId) return
  localStorage.setItem('live:userName', name)
  navigate(`/room/${encodeURIComponent(lastRoomId)}`)
}

  return (
    <div className='meet-home'>
      <header className='meet-home__header'>
        <div className='meet-home__brand'>
          <span className='meet-home__brandDot' aria-hidden='true'></span>
          <span>Live Meet</span>
        </div>
        <button className='meet-home__headerCta' onClick={handleCreateRoom}>New Meeting</button>
      </header>

      <main className='meet-home__main'>
        <section className='meet-home__hero'>
          <h1>Premium video meetings, now free for your friends</h1>
          <p>
            Create or join a room in one click. Share the room ID and start a reliable meeting from any device.
          </p>
          <div className='meet-home__heroActions'>
            <button className='meet-home__primary' onClick={handleCreateRoom}>Create Instant Meeting</button>
            {lastRoomId && (
              <button className='meet-home__secondary' onClick={handleRejoinLastRoom}>
                Rejoin {lastRoomId}
              </button>
            )}
          </div>
        </section>

        <section className='meet-home__joinCard'>
          <h2>Join with a room ID</h2>
          <p>Ask your friend for the room ID and type it below.</p>

          <div className='meet-home__field'>
            <label htmlFor='userName'>Your Name</label>
            <input
              id='userName'
              type='text'
              placeholder='Enter your name'
              value={userName}
              onChange={(e)=>setUserName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') HandleJoin()
              }}
              autoComplete='off'
            />
          </div>

          <div className='meet-home__field'>
            <label htmlFor='roomId'>Room ID</label>
            <input
              id='roomId'
              type='text'
              placeholder='Example: FAMILY2026'
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') HandleJoin()
              }}
              autoComplete='off'
            />
          </div>

          <button className='meet-home__joinBtn' onClick={HandleJoin}>Join Now</button>
        </section>
      </main>
    </div>
  )
}
