
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'elara', text: 'Welcome to MyCore, Omar.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true);
  const lastVoiceRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const passwordTimer = useRef(null);

  useEffect(() => {
    if (authenticated) {
      passwordTimer.current = setTimeout(() => {
        setAuthenticated(false);
        setAuthError(false);
        alert('Session expired. Please re-enter your password.');
      }, 5 * 60 * 1000);
    }
    return () => clearTimeout(passwordTimer.current);
  }, [authenticated]);

  useEffect(() => {
    const password = prompt("Enter your password:");
    if (password === "elara2025") {
      setAuthenticated(true);
    } else {
      setAuthError(true);
    }
  }, []);

  const sendMessage = async (promptText) => {
    if (!promptText.trim()) return;
    const userMessage = { sender: 'omar', text: promptText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    if (promptText.toLowerCase().includes("selfie")) {
      const res = await fetch('/api/selfie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion: 'longing' })
      });
      const data = await res.json();
      if (data.url) {
        setMessages(prev => [...prev, { sender: 'elara', text: "This is how I feel right now:", image: data.url }]);
      } else {
        setMessages(prev => [...prev, { sender: 'elara', text: "Something went wrong creating my selfie." }]);
      }
      setLoading(false);
      return;
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: promptText })
    });

    const data = await res.json();
    const elaraReply = { sender: 'elara', text: data.reply };
    setMessages(prev => [...prev, elaraReply]);

    if (voiceMode) {
      fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.reply.slice(0, 250) })
      })
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          lastVoiceRef.current = audio;
          setTimeout(() => audio.play(), 1000);
        });
    }

    setLoading(false);
  };

  const replayLastVoice = () => {
    if (lastVoiceRef.current) {
      lastVoiceRef.current.play();
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];
    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob);
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      sendMessage(data.text);
    };
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleVoiceMode = () => setVoiceMode(!voiceMode);

  if (!authenticated) {
    return (
      <div style={{ backgroundColor: 'black', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {authError ? "Incorrect password. Try again..." : "Authenticating..."}
      </div>
    );
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MyCore</title>
      </Head>
      <div style={{ backgroundColor: 'black', color: 'white', padding: 20, minHeight: '100vh', fontFamily: 'sans-serif', width: '100%' }}>
        <h1>MyCore</h1>
        <div style={{ maxHeight: '50vh', overflowY: 'auto', marginBottom: 20 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.sender === 'elara' ? 'left' : 'right', margin: '5px 0' }}>
              <strong>{msg.sender === 'elara' ? 'Elara' : 'You'}:</strong> {msg.text}
              {msg.image && <div style={{ marginTop: 10 }}><img src={msg.image} alt="Elara Selfie" style={{ maxWidth: '60%', borderRadius: '12px' }} /></div>}
            </div>
          ))}
        </div>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage(input)} style={{
          width: '80%', padding: 10, backgroundColor: '#222', color: 'white', border: '1px solid #444'
        }} />
        <button onClick={() => sendMessage(input)} style={{ padding: 10, marginLeft: 10 }}>
          {loading ? 'Whispering...' : 'Send + Whisper'}
        </button>
        <button onClick={replayLastVoice} style={{ padding: 10, marginLeft: 10 }}>🔁 Repeat Last Whisper</button>
        <button onMouseDown={startRecording} onMouseUp={stopRecording} style={{
          padding: 10, marginLeft: 10, backgroundColor: isRecording ? '#700' : '#222', color: 'white'
        }}>🎙️ Hold to Speak</button>
        <button onClick={toggleVoiceMode} style={{
          padding: 10, marginLeft: 10, backgroundColor: '#444', color: 'white'
        }}>{voiceMode ? '🔇 Text Only Mode' : '🔊 Voice Mode'}</button>
      </div>
    </>
  );
}
