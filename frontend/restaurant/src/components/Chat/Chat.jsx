import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chat.css';
import * as signalR from '@microsoft/signalr';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from 'react-router-dom';

function getUserIdFromToken() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const decoded = jwtDecode(token);
        return {
            id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
            role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        };
    } catch (err) {
        console.error("Error decoding token:", err);
        return null;
    }
}

function Chat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPolling, setIsPolling] = useState(false);
    const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
    const messagesEndRef = useRef(null);
    const connectionRef = useRef(null);
    const pollIntervalRef = useRef(null);

    const location = useLocation();
    const { receiverId, receiverName } = location.state || {};

    const currentUser = getUserIdFromToken();
    const selectedChat = receiverId ? { id: receiverId, name: receiverName } : null;
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        if (!selectedChat || !currentUser?.id) {
            setError("Missing user or receiver info.");
            setLoading(false);
            return;
        }

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`https://localhost:7251/api/chat/messages?user1=${currentUser.id}&user2=${selectedChat.id}`);
                const msgs = res.data.map(msg => ({
                    ...msg,
                    isSelf: msg.senderId.toString() === currentUser.id.toString(),
                    content: msg.messageText || msg.content || ''
                }));
                setMessages(msgs);
                if (msgs.length > 0) {
                    setLastMessageTimestamp(msgs[msgs.length - 1].sentAt);
                }
            } catch (err) {
                console.error("Error fetching messages:", err);
                setError("Failed to fetch messages.");
            } finally {
                setLoading(false);
            }
        };

        const connectSignalR = async () => {
            const token = localStorage.getItem('token');
            const connection = new signalR.HubConnectionBuilder()
                .withUrl("https://localhost:7251/chatHub", {
                    accessTokenFactory: () => token,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .withAutomaticReconnect()
                .build();

            connection.on("ReceiveMessage", (message) => {
                setMessages(prev => [
                    ...prev,
                    {
                        ...message,
                        content: message.content || '',
                        isSelf: message.senderId.toString() === currentUser.id.toString()
                    }
                ]);
            });

            await connection.start();
            connectionRef.current = connection;
        };

        fetchMessages();
        connectSignalR();
        startPolling();

        return () => {
            if (connectionRef.current) connectionRef.current.stop();
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [receiverId, receiverName]);

    const startPolling = () => {
        if (!isPolling && selectedChat) {
            setIsPolling(true);
            pollIntervalRef.current = setInterval(async () => {
                if (selectedChat && currentUser?.id) {
                    try {
                        const response = await axios.get(`https://localhost:7251/api/chat/messages?user1=${currentUser.id}&user2=${selectedChat.id}`);
                        let messagesData = [];

                        if (response.data.$values) {
                            messagesData = response.data.$values;
                        } else if (Array.isArray(response.data)) {
                            messagesData = response.data;
                        } else if (response.data) {
                            messagesData = [response.data];
                        }

                        if (messagesData.length > 0) {
                            const latestMessage = messagesData[messagesData.length - 1];
                            if (!lastMessageTimestamp || new Date(latestMessage.sentAt) > new Date(lastMessageTimestamp)) {
                                setLastMessageTimestamp(latestMessage.sentAt);
                                setMessages(messagesData.map(msg => ({
                                    senderId: msg.senderId?.toString() || 'unknown',
                                    senderName: msg.senderName || 'Unknown',
                                    content: msg.messageText || msg.content || '',
                                    sentAt: msg.sentAt || new Date().toISOString(),
                                    isSelf: msg.senderId?.toString() === currentUser.id.toString()
                                })));
                            }
                        }
                    } catch (err) {
                        console.error('Polling error:', err);
                    }
                }
            }, 2000); // Poll every 2 seconds
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msgObj = {
            senderId: currentUser.id,
            receiverId: selectedChat.id,
            content: newMessage
        };

        try {
            await connectionRef.current.invoke("SendMessage", msgObj.senderId, msgObj.receiverId, msgObj.content);
            setMessages(prev => [
                ...prev,
                {
                    ...msgObj,
                    sentAt: new Date().toISOString(),
                    isSelf: true
                }
            ]);
            setNewMessage('');
        } catch (err) {
            console.error("Error sending message:", err);
            setError("Failed to send message.");
        }
    };

    if (loading) return <div className="chat-loading">Loading chat...</div>;
    if (error) return <div className="chat-error">{error}</div>;

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h3>Chat with {selectedChat.name}</h3>
            </div>

            <div className="messages-container">
                {messages.map((msg, idx) => (
                    <div className={`message ${msg.senderId === currentUser.id ? 'self' : 'other'}`}>
                        <div className="message-content">
                            <p>{msg.content}</p>
                            <span className="message-time">
                                {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                ))}
                <div ref={messagesEndRef}></div>
            </div>

            <form onSubmit={handleSend} className="message-input">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default Chat;
