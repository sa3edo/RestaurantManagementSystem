import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { HubConnectionBuilder } from "@microsoft/signalr";
import "./VendorChatPage.css"; // Add this at the top


const VendorChatPage = () => {
  const [vendorId, setVendorId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [connection, setConnection] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  const pollIntervalRef = useRef(null);
const userRole = localStorage.getItem('role'); 

  // ✅ Decode vendorId from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const idFromToken = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        setVendorId(idFromToken);
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  // ✅ Fetch conversations
  useEffect(() => {
    if (vendorId) {
      axios
        .get(`https://localhost:7251/api/Chat/conversations/${vendorId}`)
        .then((res) => setConversations(res.data))
        .catch((err) => console.error("Error fetching conversations:", err));
    }
  }, [vendorId]);

  // ✅ Setup SignalR ONCE and listen for messages
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7251/chatHub")
      .withAutomaticReconnect()
      .build();

    newConnection
      .start()
      .then(() => {
        console.log("Connected to SignalR");
        setConnection(newConnection);
      })
      .catch((e) => console.log("Connection failed: ", e));

    return () => {
      newConnection.stop();
    };
  }, []);

  // ✅ SignalR listener
  useEffect(() => {
    if (connection) {
      connection.on("ReceiveMessage", (msg) => {
        if (
          selectedUser &&
          ((msg.senderId === selectedUser && msg.receiverId === vendorId) ||
            (msg.senderId === vendorId && msg.receiverId === selectedUser))
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      });
    }
  }, [connection, selectedUser, vendorId]);

  // ✅ Load chat history + start polling
  const openChat = (userId) => {
    setSelectedUser(userId);
    axios
      .get(`https://localhost:7251/api/Chat/messages?user1=${vendorId}&user2=${userId}`)
      .then((res) => {
        setMessages(res.data);
        if (res.data.length > 0) {
          const latest = res.data[res.data.length - 1];
          setLastMessageTimestamp(latest.sentAt);
        }
      })
      .catch((err) => console.error("Error loading messages:", err));
  };

  // ✅ Polling function
  const startPolling = () => {
    if (!isPolling && selectedUser && vendorId) {
      setIsPolling(true);
      pollIntervalRef.current = setInterval(async () => {
        try {
          const senderId = vendorId;
          const receiverId = selectedUser;

          const response = await axios.get(`https://localhost:7251/api/Chat/messages?user1=${senderId}&user2=${receiverId}`);

          let messagesData = Array.isArray(response.data) ? response.data : response.data?.$values || [];

          if (messagesData.length > 0) {
            const latestMessage = messagesData[messagesData.length - 1];
            if (!lastMessageTimestamp || new Date(latestMessage.sentAt) > new Date(lastMessageTimestamp)) {
              setLastMessageTimestamp(latestMessage.sentAt);
              setMessages(messagesData);
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000);
    }
  };

  // ✅ Start/stop polling based on selectedUser
  useEffect(() => {
    if (selectedUser) {
      startPolling();
    }

    return () => {
      clearInterval(pollIntervalRef.current);
      setIsPolling(false);
    };
  }, [selectedUser]);

  // ✅ Send message
  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const chatMessage = {
      senderId: vendorId,
      receiverId: selectedUser,
      content: messageInput,
    };

    axios
      .post("https://localhost:7251/api/Chat/send", chatMessage)
      .then(() => setMessageInput(""))
      .catch((err) => console.error("Sending message failed:", err));
  };

 return (
  <div className="vendor-chat-container">
    <div className="conversations-list">
      <h3>Conversations</h3>
      <ul>
        {conversations.map((conv) => (
          <li
            key={conv.id}
            className={selectedUser === conv.userId ? "active" : ""}
            onClick={() => openChat(conv.userId)}
          >
            User ID: {conv.userId}
          </li>
        ))}
      </ul>
    </div>

    <div className="chat-section">
      <h3>Messages</h3>
      {selectedUser ? (
        <>
          <div className="messages-box d-flex flex-column">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message-bubble ${
                  msg.senderId === vendorId ? "you" : "other"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      ) : (
        <p>Select a conversation to view messages</p>
      )}
    </div>
  </div>
);

};

export default VendorChatPage;
