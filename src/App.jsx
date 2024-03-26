import React, { useState, useEffect } from 'react'
import './App.css'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import { getFirestore, onSnapshot, collection, addDoc, orderBy, query, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'
import { auth, app } from '../firebase'

const db = getFirestore(app)

function App() {
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp"))
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      })))
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })
  }, [])

  const sendMessage = async () => {
    if (newMessage.trim() === "") {
      alert("Không thể gửi tin nhắn trống.")
      return;
    }

    await addDoc(collection(db, "messages"), {
      uid: user.uid,
      photoURL: user.photoURL,
      displayName: user.displayName,
      text: newMessage,
      timestamp: serverTimestamp()
    })
    setNewMessage("")
  }

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, "messages", messageId))
    } catch (error) {
      console.error("Error deleting message: ", error)
    }
  }

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider()

    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.log(error)
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      sendMessage();
    } else if (event.shiftKey && event.key === 'Enter') {
      setNewMessage(prevMessage => prevMessage + '\n');
    }
  }

  return (
    <div className='container'>
      {user ? (
        <div className="chat-container" >

          <div className='cuoi-chat'>
            <div className="message-container">
              <ul className="message-list">
                {messages.map(msg => (
                  <li key={msg.id} className={`message ${msg.data.uid === user.uid ? 'sent' : 'received'}`}>
                    <div className="message-content">
                      <div className="left-mess"><img className='user-avatar' src={msg.data.photoURL} alt="User Avatar" /></div>
                      <div className="midle-mess">
                        <div className="messenger-main">
                          <div className="user-info" >{msg.data.displayName}</div>
                          <div className="message-text">{msg.data.text}</div>
                        </div>
                        <div className="message-time">{msg.data.timestamp && new Date(msg.data.timestamp.toDate()).toLocaleString()}</div>
                      </div>
                      <div className="right-mess">
                        {msg.data.uid === user.uid && ( // Chỉ hiển thị nút xóa cho tin nhắn của người dùng hiện tại
                          <button className="delete-button" onClick={() => handleDeleteMessage(msg.id)}>Xóa</button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className='botton-chat'>
              <input
                className="message-input"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress} // Thêm sự kiện này để bắt phím Enter
                placeholder=" Aa"
              />
              <button className='send-button' onClick={sendMessage}>Gửi</button>
            </div>

          </div>
          <div className='dau-chat'>
            <label> Hội Liên Hiệp Phụ Nữ </label>
            <label>Phường Hòa Khánh Bắc</label>
            <br />
            <div className='right-c' style={{ flex: 4 }}>
              <div className="alo" >Hội Viên {user.displayName}</div>
              <div className="left-messs"><img className='user-avatar' src={user.photoURL} alt="User Avatar" /></div>
            </div>
            <div style={{ flex: 1 }}>  <button className='logout-button' onClick={() => auth.signOut()}>Đăng Xuất</button></div>
          </div>
        </div>
      ) : (
        <div className="chat-login">
          <label className='title-login'> Phụ Nữ Phường Hòa Khánh Bắc</label>
          <br />
          <label className='title-dangnhap'>Đăng Nhập</label>
          <br />
          <input type="text" name="" id="" className='input-text' placeholder='Tài Khoản' />
          <input type="password" name="" id="" className='input-text' placeholder='Mật Khẩu' />
          <button className="login-button">Đăng Nhập</button>
          <br />
          <button className="login-button" onClick={handleGoogleLogin}>Đăng Nhập với Google</button>
          <br />
          <a href=""><button className="login-button">Bạn Không phải hội viên ?</button></a>
        </div>
      )}
    </div>
  )
}

export default App
