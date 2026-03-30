import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import './Room.css'

const DEFAULT_MEETING_SETTINGS = {
  startWithMic: true,
  startWithCamera: true,
  showRoomTimer: true,
  showUserList: true,
  showTextChat: true,
  showLayoutButton: true,
  autoHideFooter: false
}

function randomID(len) {
  let result = '';
  if (result) return result;
  var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

function getPersistentParticipant(roomKey) {
  const storageKey = `live:participant:${roomKey}`
  const savedUserName = localStorage.getItem('live:userName')
  const storedRaw = localStorage.getItem(storageKey)

  // If we have a saved user name, always use/update it
  if (savedUserName) {
    if (storedRaw) {
      try {
        const stored = JSON.parse(storedRaw)
        if (stored?.userId) {
          // Update with new name
          const updated = { ...stored, userName: savedUserName }
          localStorage.setItem(storageKey, JSON.stringify(updated))
          return updated
        }
      } catch {
        localStorage.removeItem(storageKey)
      }
    }
    // Create new participant with the saved name
    const participant = {
      userId: randomID(8),
      userName: savedUserName
    }
    localStorage.setItem(storageKey, JSON.stringify(participant))
    return participant
  }

  // Fallback to stored participant if no saved name
  if (storedRaw) {
    try {
      const stored = JSON.parse(storedRaw)
      if (stored?.userId && stored?.userName && !stored.userName.startsWith('Guest-')) {
        return stored
      }
    } catch {
      localStorage.removeItem(storageKey)
    }
  }

  // Force user to enter name if no valid name found
  return null;
}
export default function Room() {
  let { roomId } = useParams()
  const navigate = useNavigate()
  const decodedRoomId = useMemo(() => decodeURIComponent(roomId || '').trim(), [roomId])
  const inviteUrl = `${window.location.origin}/room/${encodeURIComponent(decodedRoomId)}`
  const [copyLabel, setCopyLabel] = useState('Copy Invite')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [localHandRaised, setLocalHandRaised] = useState(false)
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)
  const [raisedUsers, setRaisedUsers] = useState({})
  const [reactions, setReactions] = useState([])
  const [meetingSettings, setMeetingSettings] = useState(() => {
    try {
      const raw = localStorage.getItem('live:meetingSettings')
      if (!raw) return DEFAULT_MEETING_SETTINGS
      return { ...DEFAULT_MEETING_SETTINGS, ...JSON.parse(raw) }
    } catch {
      return DEFAULT_MEETING_SETTINGS
    }
  })
  const hasJoinedRef = useRef(false)
  const zpRef = useRef(null)
  const [participant, setParticipant] = useState(() => {
    if (!decodedRoomId) return null
    return getPersistentParticipant(decodedRoomId)
  })
  const [tempName, setTempName] = useState('')

  function handleProvideName() {
    if (!tempName.trim()) return
    const name = tempName.trim()
    localStorage.setItem('live:userName', name)
    const newParticipant = {
      userId: randomID(8),
      userName: name
    }
    const storageKey = `live:participant:${decodedRoomId}`
    localStorage.setItem(storageKey, JSON.stringify(newParticipant))
    setParticipant(newParticipant)
  }

  const appID = 616141323;
  const serverSecret = "c47d4dcb5ad327e0bf5553227b282acc";
  const kitToken = useMemo(() => {
    if (!decodedRoomId || !participant) return null
    return ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, decodedRoomId, participant.userId, participant.userName)
  }, [appID, serverSecret, decodedRoomId, participant])

  useEffect(() => {
    if (!decodedRoomId) return
    localStorage.setItem('live:lastRoomId', decodedRoomId)
  }, [decodedRoomId])

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('live:meetingSettings', JSON.stringify(meetingSettings))
  }, [meetingSettings])

  const pushReaction = useCallback((emoji, userName = 'Guest') => {
    const reactionId = `${Date.now()}-${Math.random()}`
    const rise = 180 + Math.floor(Math.random() * 120)
    const driftX = -26 + Math.floor(Math.random() * 53)
    const spin = -16 + Math.floor(Math.random() * 33)
    const duration = (3.4 + Math.random() * 1.1).toFixed(2)

    setReactions((prev) => [
      ...prev,
      { id: reactionId, emoji, userName, rise, driftX, spin, duration }
    ])
    window.setTimeout(() => {
      setReactions((prev) => prev.filter((item) => item.id !== reactionId))
    }, 4600)
  }, [])

  const applyHandRaise = useCallback((userID, userName, raised) => {
    if (!userID) return
    setRaisedUsers((prev) => {
      const next = { ...prev }
      if (raised) {
        next[userID] = userName || userID
      } else {
        delete next[userID]
      }
      return next
    })
  }, [])

  const handleCustomCommands = useCallback((commands = []) => {
    commands.forEach((item) => {
      const payload = item?.command
      if (!payload || typeof payload !== 'object') return

      if (payload.type === 'REACTION' && payload.emoji) {
        pushReaction(payload.emoji, payload.userName || 'Guest')
      }

      if (payload.type === 'HAND_RAISE') {
        const senderId = payload.userID || item.senderUserID
        applyHandRaise(senderId, payload.userName, Boolean(payload.raised))
      }
    })
  }, [applyHandRaise, pushReaction])

  const myMeeting = useCallback(async (element) => {
    if (!element || hasJoinedRef.current || !kitToken) return
    hasJoinedRef.current = true
    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zpRef.current = zp
    // start the call
    zp.joinRoom({
      container: element,
      showPreJoinView: false,
      turnOnMicrophoneWhenJoining: meetingSettings.startWithMic,
      turnOnCameraWhenJoining: meetingSettings.startWithCamera,
      showMyMicrophoneToggleButton: true,
      showMyCameraToggleButton: true,
      showScreenSharingButton: true,
      showTextChat: meetingSettings.showTextChat,
      showUserList: meetingSettings.showUserList,
      showRoomTimer: meetingSettings.showRoomTimer,
      showLayoutButton: meetingSettings.showLayoutButton,
      autoHideFooter: meetingSettings.autoHideFooter,
      showRoomDetailsButton: true,
      onInRoomCustomCommandReceived: handleCustomCommands,
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
      config: {
        branding: {
          logoURL: '',
        }
      },
      sharedLinks: [
        {
          name: "Copy Link",
          url: inviteUrl
        }
      ]
    });

    // Apply custom styling for white and blue theme
    setTimeout(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        /* Dark mode theme */
        .zmg-video-container {
          background: #0d1117 !important;
        }
        
        .zmg-common-bottom-bar {
          background: rgba(20, 24, 32, 0.98) !important;
          border-top: 1px solid rgba(100, 100, 120, 0.3) !important;
        }
        
        /* Button styling */
        .zmg-common-button {
          background-color: #1f6feb !important;
          color: white !important;
        }
        
        .zmg-common-button:hover {
          background-color: #388bfd !important;
        }
        
        /* Hangup button - keep red */
        .zmg-common-button.hang-up,
        [class*="hang-up"] {
          background-color: #da3633 !important;
          color: white !important;
        }
        
        .zmg-common-button.hang-up:hover,
        [class*="hang-up"]:hover {
          background-color: #f85149 !important;
        }
        
        /* Top bar */
        .zmg-common-top-bar {
          background: rgba(20, 24, 32, 0.95) !important;
          border-bottom: 1px solid rgba(100, 100, 120, 0.2) !important;
          color: #e0e0e0 !important;
        }
        
        /* Text colors */
        .zmg-common-top-bar span,
        .zmg-common-top-bar p {
          color: #e0e0e0 !important;
        }
        
        /* Meeting info */
        .zmg-prebuilt__wrapper {
          background: #0d1117 !important;
        }
      `;
      document.head.appendChild(style);
    }, 100);
  }, [kitToken, inviteUrl, handleCustomCommands, meetingSettings]);

  useEffect(() => {
    return () => {
      hasJoinedRef.current = false
      if (zpRef.current) {
        zpRef.current.destroy()
        zpRef.current = null
      }
    }
  }, [])

  async function handleCopyInvite() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopyLabel('Copied')
      setTimeout(() => setCopyLabel('Copy Invite'), 1600)
    } catch {
      setCopyLabel('Copy Failed')
      setTimeout(() => setCopyLabel('Copy Invite'), 1800)
    }
  }

  async function handleSendReaction(emoji) {
    if (!participant) return
    setIsEmojiOpen(false)
    pushReaction(emoji, participant.userName)
    if (!zpRef.current) return

    try {
      await zpRef.current.sendInRoomCustomCommand({
        type: 'REACTION',
        emoji,
        userID: participant.userId,
        userName: participant.userName,
        ts: Date.now()
      })
    } catch {
      // No-op: local reaction is already rendered.
    }
  }

  async function handleToggleHandRaise() {
    if (!participant) return
    const nextRaised = !localHandRaised
    setLocalHandRaised(nextRaised)
    applyHandRaise(participant.userId, participant.userName, nextRaised)

    if (!zpRef.current) return

    try {
      await zpRef.current.sendInRoomCustomCommand({
        type: 'HAND_RAISE',
        raised: nextRaised,
        userID: participant.userId,
        userName: participant.userName,
        ts: Date.now()
      })
    } catch {
      // No-op: local state still updates for user feedback.
    }
  }

  function toggleMeetingSetting(key) {
    setMeetingSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (!decodedRoomId) {
    return (
      <div className='room room--empty'>
        <div className='room__emptyCard'>
          <h2>Room ID is missing</h2>
          <p>Please go back and enter a valid room ID.</p>
          <button className='room__exit room__exit--outline' onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    )
  }

  if (!participant) {
    return (
      <div className='room room--empty'>
        <div className='room__emptyCard'>
          <h2 style={{ marginBottom: '10px' }}>Join Room: {decodedRoomId}</h2>
          <p>Please enter your name to join the meeting.</p>
          <input
            type="text"
            placeholder="Ex. Haris"
            value={tempName}
            onChange={e => setTempName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleProvideName()}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '16px',
              marginBottom: '20px',
              borderRadius: '8px',
              border: '2px solid #1a73e8',
              color: '#202124',
              fontSize: '16px',
              backgroundColor: '#f8fafd'
            }}
            autoFocus
          />
          <button
            className='room__exit room__exit--outline'
            style={{ width: '100%', background: 'linear-gradient(135deg, #1a73e8 0%, #185abc 100%)', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s ease' }}
            onClick={handleProvideName}
          >
            Join Meeting
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className='room'>
      <div className='room__reactionsLayer'>
        {reactions.map((reaction) => (
          <div
            key={reaction.id}
            className='room__reactionItem'
            style={{
              '--rise': `${reaction.rise}px`,
              '--driftX': `${reaction.driftX}px`,
              '--spin': `${reaction.spin}deg`,
              '--duration': `${reaction.duration}s`
            }}
          >
            <span>{reaction.emoji}</span>
          </div>
        ))}
      </div>

      <div className='room__topbar'>
        <div>
          <p className='room__label'>Meeting ready</p>
          <p className='room__id'>Room: {decodedRoomId}</p>
        </div>
        <div className='room__actions'>
          <span className='room__user'>{participant?.userName}</span>
          <button className='room__settingsBtn' onClick={() => setIsSettingsOpen((prev) => !prev)}>Settings</button>
          <button className='room__copy' onClick={handleCopyInvite}>{copyLabel}</button>
          <button className='room__exit' onClick={() => navigate('/')}>Leave</button>
        </div>
      </div>

      {isSettingsOpen && (
        <div className='room__settingsPanel'>
          <h3>Meeting Settings</h3>

          <label><input type='checkbox' checked={meetingSettings.startWithMic} onChange={() => toggleMeetingSetting('startWithMic')} /> Start with microphone</label>
          <label><input type='checkbox' checked={meetingSettings.startWithCamera} onChange={() => toggleMeetingSetting('startWithCamera')} /> Start with camera</label>
          <label><input type='checkbox' checked={meetingSettings.showRoomTimer} onChange={() => toggleMeetingSetting('showRoomTimer')} /> Show room timer</label>
          <label><input type='checkbox' checked={meetingSettings.showUserList} onChange={() => toggleMeetingSetting('showUserList')} /> Show participant list</label>
          <label><input type='checkbox' checked={meetingSettings.showTextChat} onChange={() => toggleMeetingSetting('showTextChat')} /> Show text chat</label>
          <label><input type='checkbox' checked={meetingSettings.showLayoutButton} onChange={() => toggleMeetingSetting('showLayoutButton')} /> Show layout switch</label>
          <label><input type='checkbox' checked={meetingSettings.autoHideFooter} onChange={() => toggleMeetingSetting('autoHideFooter')} /> Auto-hide controls</label>

          <div className='room__settingsDivider'></div>
          <h4>Reactions</h4>
          <div className='room__settingsActionRow'>
            <button className={`room__toggleBtn ${localHandRaised ? 'room__toggleBtn--active' : ''}`} onClick={handleToggleHandRaise}>Raise Hand</button>
            <button className={`room__toggleBtn ${isEmojiOpen ? 'room__toggleBtn--active' : ''}`} onClick={() => setIsEmojiOpen((prev) => !prev)}>Emojis</button>
          </div>

          {isEmojiOpen && (
            <div className='room__emojiPanel'>
              <button className='room__quickBtn' onClick={() => handleSendReaction('👍')}>👍</button>
              <button className='room__quickBtn' onClick={() => handleSendReaction('👏')}>👏</button>
              <button className='room__quickBtn' onClick={() => handleSendReaction('🎉')}>🎉</button>
              <button className='room__quickBtn' onClick={() => handleSendReaction('😂')}>😂</button>
              <button className='room__quickBtn' onClick={() => handleSendReaction('❤️')}>❤️</button>
              <button className='room__quickBtn' onClick={() => handleSendReaction('🔥')}>🔥</button>
              <button className='room__quickBtn' onClick={() => handleSendReaction('😮')}>😮</button>
              <button className='room__quickBtn' onClick={() => handleSendReaction('🤩')}>🤩</button>
              <button className='room__quickBtn' onClick={() => handleSendReaction('🙏')}>🙏</button>
            </div>
          )}

          <p>Saved automatically. Press Apply now to use these settings in this room.</p>
          <button className='room__settingsApply' onClick={() => window.location.reload()}>Apply Now</button>
        </div>
      )}

      {Object.keys(raisedUsers).length > 0 && (
        <div className='room__raisedList'>
          <span>Hands raised:</span>
          <span>{Object.values(raisedUsers).slice(0, 3).join(', ')}</span>
          {Object.keys(raisedUsers).length > 3 && <span>+{Object.keys(raisedUsers).length - 3} more</span>}
        </div>
      )}

      <div className='room__callWrap'>
        <div
          className='room__call'
          ref={myMeeting}
          style={{ width: '100%', height: '100%' }}
        ></div>
      </div>
    </div>
  )
}
