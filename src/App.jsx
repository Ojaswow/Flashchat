import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, setDoc, doc, updateDoc, arrayUnion, arrayRemove, getDoc, deleteDoc } from "firebase/firestore";
import { MessageSquare, Search, UserPlus, Settings, Send, Camera, UserCircle, LogOut, Trash2, ArrowLeft, Check, X } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyAsOcxAgpH7PklXIooHzEXsPy-j8zzo8Zs",
  authDomain: "flashchatojas.firebaseapp.com",
  projectId: "flashchatojas",
  storageBucket: "flashchatojas.firebasestorage.app",
  messagingSenderId: "388981107565",
  appId: "1:388981107565:web:a5f6ff097fe2fd17d18864"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const VBadge = () => (
  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', background: 'linear-gradient(45deg, #ffd700, #b8860b)', border: '1.5px solid #fff', boxShadow: '0 0 5px #ffd700', fontSize: '9px', fontWeight: '900', color: 'black', marginLeft: '5px' }}>V</div>
);

function App() {
  const [activeTab, setActiveTab] = useState('chats'); 
  const [user, setUser] = useState(null);
  const [authData, setAuthData] = useState({ username: '', name: '', password: '' });
  const [allUsers, setAllUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const uid = authData.username.toLowerCase().trim();
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      if (snap.data().password === authData.password) setUser(snap.data());
      else alert("Wrong Password!");
    } else {
      const newUser = { id: uid, name: authData.name || authData.username, password: authData.password, pic: null, bio: 'Flash Chatting!', friends: [], requests: [] };
      await setDoc(userRef, newUser);
      setUser(newUser);
    }
  };

  // Actions
  const sendInvite = async (targetId) => {
    await updateDoc(doc(db, "users", targetId), { requests: arrayUnion(user.id) });
  };

  const acceptInvite = async (senderId) => {
    await updateDoc(doc(db, "users", user.id), { friends: arrayUnion(senderId), requests: arrayRemove(senderId) });
    await updateDoc(doc(db, "users", senderId), { friends: arrayUnion(user.id) });
  };

  const ignoreInvite = async (senderId) => {
    await updateDoc(doc(db, "users", user.id), { requests: arrayRemove(senderId) });
  };

  // ADMIN POWER: DELETE USER
  const deleteUser = async (targetId) => {
    if (window.confirm(`King Ojas, are you sure you want to ban ${targetId}?`)) {
      await deleteDoc(doc(db, "users", targetId));
    }
  };

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.id), (d) => d.exists() && setUser(d.data()));
  }, [user?.id]);

  useEffect(() => {
    return onSnapshot(collection(db, "users"), (s) => {
      setAllUsers(s.docs.map(d => ({...d.data(), id: d.id})));
    });
  }, []);

  useEffect(() => {
    if (!activeChat || !user) return;
    const cid = [user.id, activeChat.id].sort().join('_');
    return onSnapshot(query(collection(db, "chats", cid, "messages"), orderBy("createdAt", "asc")), (s) => setMessages(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [activeChat, user?.id]);

  if (!user) return (
    <div style={{ height: '100dvh', background: '#0b141b', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '350px', background: '#1e2933', padding: '35px', borderRadius: '30px', textAlign: 'center' }}>
        <h2 style={{ color: 'white', marginBottom: '25px', letterSpacing: '2px' }}>FLASH CHAT</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input placeholder="Username" value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} required style={{ padding: '15px', borderRadius: '12px', background: '#0b141b', color: 'white', border: '1px solid #2c3943', outline: 'none' }} />
          <input type="password" placeholder="Password" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} required style={{ padding: '15px', borderRadius: '12px', background: '#0b141b', color: 'white', border: '1px solid #2c3943', outline: 'none' }} />
          <button type="submit" style={{ padding: '15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>JOIN</button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100dvh', width: '100vw', background: '#0b141b', color: 'white', overflow: 'hidden' }}>
      
      <div style={{ width: isMobile ? '100%' : '70px', height: isMobile ? '65px' : '100%', background: '#081017', display: 'flex', flexDirection: isMobile ? 'row' : 'column', justifyContent: 'space-around', alignItems: 'center', borderRight: isMobile ? 'none' : '1px solid #232d36', borderTop: isMobile ? '1px solid #232d36' : 'none', order: isMobile ? 2 : 1, zIndex: 10 }}>
        <MessageSquare onClick={() => {setActiveTab('chats'); setActiveChat(null);}} size={22} color={activeTab === 'chats' ? '#007bff' : '#4f5e6a'} />
        <Search onClick={() => {setActiveTab('search'); setActiveChat(null);}} size={22} color={activeTab === 'search' ? '#007bff' : '#4f5e6a'} />
        <UserPlus onClick={() => {setActiveTab('requests'); setActiveChat(null);}} size={22} color={activeTab === 'requests' ? '#007bff' : '#4f5e6a'} />
        <Settings onClick={() => {setActiveTab('profile'); setActiveChat(null);}} size={22} color={activeTab === 'profile' ? '#007bff' : '#4f5e6a'} />
        <LogOut onClick={() => setUser(null)} size={20} color="#ff4b4b" />
      </div>

      <div style={{ flex: 1, display: 'flex', order: 1, overflow: 'hidden', width: '100%' }}>
        {(!activeChat || !isMobile) && activeTab !== 'profile' && (
          <div style={{ width: isMobile ? '100%' : '300px', borderRight: '1px solid #232d36', background: '#0f1721', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '15px', borderBottom: '1px solid #232d36' }}>
              <h3 style={{color: '#007bff', fontSize: '16px'}}>{activeTab.toUpperCase()}</h3>
              {activeTab === 'search' && (
                <input placeholder="Search username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', marginTop: '10px', padding: '8px 12px', background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
              )}
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === 'chats' && allUsers.filter(u => user.friends?.includes(u.id)).map(u => (
                <div key={u.id} onClick={() => setActiveChat(u)} style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', border: u.id === 'mr..admin' ? '2px solid #ffd700' : 'none' }}>
                    {u.pic ? <img src={u.pic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <UserCircle size={45} color="#8696a0"/>}
                  </div>
                  <div>
                    <div style={{fontWeight:'600', color: u.id === 'mr..admin' ? '#ffd700' : 'white', display:'flex', alignItems:'center'}}>{u.name} {u.id === 'mr..admin' && <VBadge />}</div>
                    <div style={{fontSize:'12px', color:'#4f5e6a'}}>{u.bio}</div>
                  </div>
                </div>
              ))}

              {activeTab === 'search' && allUsers.filter(u => u.id !== user.id && u.id.includes(searchQuery.toLowerCase())).map(u => (
                <div key={u.id} style={{ padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <div style={{width:'35px', height:'35px', borderRadius:'50%', overflow:'hidden'}}>
                      {u.pic ? <img src={u.pic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <UserCircle size={35} color="#8696a0"/>}
                    </div>
                    <span style={{color: u.id === 'mr..admin' ? '#ffd700' : 'white', fontSize:'14px'}}>{u.name} {u.id === 'mr..admin' && <VBadge />}</span>
                  </div>
                  <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                    {user.id === 'mr..admin' && u.id !== 'mr..admin' && (
                      <Trash2 size={18} color="#ff4b4b" onClick={() => deleteUser(u.id)} style={{cursor:'pointer'}} />
                    )}
                    {!user.friends?.includes(u.id) && (
                      u.requests?.includes(user.id) ? <span style={{fontSize:'11px', color:'#4f5e6a'}}>Invited</span> :
                      <button onClick={() => sendInvite(u.id)} style={{background:'#007bff', color:'white', border:'none', padding:'5px 12px', borderRadius:'8px', fontSize:'11px'}}>Invite</button>
                    )}
                  </div>
                </div>
              ))}

              {activeTab === 'requests' && allUsers.filter(u => user.requests?.includes(u.id)).map(u => (
                <div key={u.id} style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', margin: '10px', borderRadius: '12px' }}>
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <div style={{width:'35px', height:'35px', borderRadius:'50%', overflow:'hidden'}}>{u.pic ? <img src={u.pic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <UserCircle size={35} color="#8696a0"/>}</div>
                    <span style={{fontSize:'13px'}}>{u.name}</span>
                  </div>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button onClick={() => acceptInvite(u.id)} style={{background:'#28a745', border:'none', borderRadius:'50%', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center'}}><Check size={16} color="white"/></button>
                    <button onClick={() => ignoreInvite(u.id)} style={{background:'#ff4b4b', border:'none', borderRadius:'50%', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center'}}><X size={16} color="white"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeChat || activeTab === 'profile' || !isMobile) && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0b141b', width: '100%', overflowY: 'auto' }}>
            {activeTab === 'profile' ? (
              <div style={{ width: '100%', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80%' }}>
                <div style={{ width: '100%', maxWidth: '350px', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 25px' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: user.id === 'mr..admin' ? '3px solid #ffd700' : '2px solid #007bff', overflow: 'hidden' }}>
                      {user.pic ? <img src={user.pic} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <UserCircle size={110} color="#8696a0"/>}
                    </div>
                    <label style={{ position: 'absolute', bottom: '0', right: '0', background: '#007bff', padding: '6px', borderRadius: '50%', cursor: 'pointer', border: '2px solid #0b141b' }}><Camera size={16}/><input type="file" style={{display:'none'}} onChange={(e) => { const r = new FileReader(); r.onload=(ev)=>updateDoc(doc(db,"users",user.id),{pic:ev.target.result}); r.readAsDataURL(e.target.files[0]); }}/></label>
                  </div>
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div><p style={{fontSize:'11px', color:'#007bff', marginBottom:'5px', fontWeight:'bold'}}>NAME {user.id === 'mr..admin' && <VBadge />}</p><input value={user.name} onChange={e => updateDoc(doc(db,"users",user.id),{name:e.target.value})} style={{width:'100%', padding:'12px', background:'#1e293b', border:'1px solid #2c3943', borderRadius:'10px', color:'white', outline:'none'}}/></div>
                    <div><p style={{fontSize:'11px', color:'#4f5e6a', marginBottom:'5px'}}>BIO</p><textarea value={user.bio} onChange={e => updateDoc(doc(db,"users",user.id),{bio:e.target.value})} style={{width:'100%', padding:'12px', background:'#1e293b', border:'1px solid #2c3943', borderRadius:'10px', color:'white', height:'80px', resize:'none', outline:'none'}}/></div>
                  </div>
                </div>
              </div>
            ) : activeChat ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '12px 15px', borderBottom: '1px solid #232d36', display: 'flex', alignItems: 'center', gap: '12px', background: '#081017' }}>
                  {isMobile && <ArrowLeft onClick={() => setActiveChat(null)} size={20} />}
                  <div style={{fontWeight:'bold', fontSize:'15px'}}>{activeChat.name}</div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {messages.map(m => <div key={m.id} style={{ alignSelf: m.senderId === user.id ? 'flex-end' : 'flex-start', background: m.senderId === user.id ? '#007bff' : '#232d36', padding: '8px 14px', borderRadius: '14px', maxWidth: '80%', fontSize:'13.5px' }}>{m.text}</div>)}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if(!input.trim()) return; const cid = [user.id, activeChat.id].sort().join('_'); addDoc(collection(db, "chats", cid, "messages"), { text: input, createdAt: serverTimestamp(), senderId: user.id }); setInput(''); }} style={{ padding: '10px 15px', display: 'flex', gap: '10px', background:'#081017', alignItems: 'center' }}>
                  <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type..." style={{ flex: 1, background: '#1e293b', border: 'none', padding: '10px 15px', borderRadius: '20px', color: 'white', outline:'none', fontSize: '14px' }} />
                  <button type="submit" style={{ background: '#007bff', border: 'none', width: '38px', height: '38px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Send size={16} /></button>
                </form>
              </div>
            ) : <div style={{flex:1, display:'flex', justifyContent:'center', alignItems:'center', color:'#4f5e6a'}}>Pick someone, King Ojas!</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
