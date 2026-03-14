// SingleChat.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Spacer,
  Spinner,
  Input,
} from "@chakra-ui/react";
import { Avatar } from "./ui/avatar";

import { IoArrowBack } from "react-icons/io5";
import { AiOutlineEye } from "react-icons/ai";
import axios from "axios";
import io from "socket.io-client";

import ScrolabelChat from "./ScrolabelChat";
import { ChatState } from "../Context/ChatProvider";
import { getSenderFull } from "@/config/Chatlogic";
import ProfileModal from "./mics/ProfileModal";
import UpdateGroupChatModal from "./mics/UpdateGroupChatModal";
import { toaster } from "@/components/ui/toaster";
import "./styles.css";

const ENDPOINT =
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`);

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const selectedChatCompareRef = useRef(null);

  const typingRef = useRef(false);
  const lastTypingTimeRef = useRef(0);
  const typingTimeoutRef = useRef(null);

  // ✅ keep socket in a ref (NOT a global var)
  const socketRef = useRef(null);

  const {
    user,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  // ✅ helper: update chat list preview + move chat to top
  const bumpChatToTop = (newMsg) => {
    if (!newMsg?.chat?._id) return;
    if (typeof setChats !== "function") return;

    setChats((prev = []) => {
      const updated = prev.map((c) =>
        c._id === newMsg.chat._id ? { ...c, latestMessage: newMsg } : c
      );

      const target = updated.find((c) => c._id === newMsg.chat._id);

      // If chat isn't in list yet, add it
      if (!target)
        return [{ ...newMsg.chat, latestMessage: newMsg }, ...updated];

      // Move chat to top
      return [target, ...updated.filter((c) => c._id !== newMsg.chat._id)];
    });
  };

  // ✅ SOCKET SETUP + ALL LISTENERS ATTACHED HERE (IMPORTANT FIX)
  useEffect(() => {
    if (!user?._id) return;

    const s = io(ENDPOINT);
    socketRef.current = s;

    s.emit("setup", user);

    const onConnected = () => setSocketConnected(true);

    const onTyping = (payload) => {
      // supports both styles: payload object or simple signal
      const from = payload?.user;
      if (from && from._id !== user._id) {
        setTypingUser(from);
        setIsTyping(true);
        return;
      }
      setIsTyping(true);
    };

    const onStopTyping = () => {
      setIsTyping(false);
      setTypingUser(null);
    };

    const onMessageReceived = (newMsg) => {
      if (!newMsg?.chat?._id) return;

      // ✅ update chat list latestMessage + reorder (so sidebar shows latest)
      bumpChatToTop(newMsg);

      const current = selectedChatCompareRef.current;

      // same open chat -> show in window
      if (current && current._id === newMsg.chat._id) {
        setMessages((prev) => [...prev, newMsg]);
        return;
      }

      // different chat -> notification
      if (typeof setNotification === "function") {
        setNotification((prev = []) => {
          if (prev.some((n) => n._id === newMsg._id)) return prev;
          return [newMsg, ...prev];
        });
      }
    };

    const onConnectError = (err) => {
      console.log("❌ SOCKET CONNECT ERROR:", err.message);
    };

    s.on("connected", onConnected);
    s.on("typing", onTyping);
    s.on("stop typing", onStopTyping);
    s.on("message recieved", onMessageReceived);
    s.on("connect_error", onConnectError);

    return () => {
      s.off("connected", onConnected);
      s.off("typing", onTyping);
      s.off("stop typing", onStopTyping);
      s.off("message recieved", onMessageReceived);
      s.off("connect_error", onConnectError);
      s.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const fetchMessages = async () => {
    if (!selectedChat?._id) return;

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data || []);

      // ✅ join chat room AFTER socket exists
      socketRef.current?.emit("join chat", selectedChat._id);

      // reset typing state on chat switch
      setIsTyping(false);
      setTypingUser(null);
      typingRef.current = false;
      setTyping(false);
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description:
          error?.response?.data?.message || "Failed to Load the Messages",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedChat?._id) return;

    selectedChatCompareRef.current = selectedChat;
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?._id]);

  const sendMessage = async (event) => {
    if (event.key !== "Enter") return;

    const text = newMessage.trim();
    if (!text || !selectedChat?._id) return;

    socketRef.current?.emit("stop typing", selectedChat._id);
    typingRef.current = false;
    setTyping(false);

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      setNewMessage("");

      const { data } = await axios.post(
        "/api/message",
        { content: text, chatId: selectedChat._id },
        config
      );

      socketRef.current?.emit("new message", data);

      // ✅ show instantly
      setMessages((prev) => [...prev, data]);

      // ✅ update latest message in sidebar/chat list instantly
      bumpChatToTop(data);
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: "Failed to send the Message",
      });
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected || !socketRef.current || !selectedChat?._id) return;

    if (!typingRef.current) {
      typingRef.current = true;
      setTyping(true);

      // keep your payload style (works if your server handles it)
      socketRef.current.emit("typing", {
        room: selectedChat._id,
        user: { _id: user._id, name: user.name },
      });
    }

    lastTypingTimeRef.current = Date.now();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      const timeDiff = Date.now() - lastTypingTimeRef.current;

      if (timeDiff >= 3000 && typingRef.current) {
        socketRef.current?.emit("stop typing", {
          room: selectedChat._id,
          user: { _id: user._id, name: user.name },
        });
        typingRef.current = false;
        setTyping(false);
      }
    }, 3000);
  };

  const sender =
    selectedChat && !selectedChat.isGroupChat
      ? getSenderFull(user, selectedChat.users)
      : null;

  if (!selectedChat) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="100%">
        <Text fontSize="3xl" pb={3} fontFamily="Work Sans">
          Click on a user to start chatting
        </Text>
      </Box>
    );
  }

  const title = !selectedChat.isGroupChat
    ? sender?.name
    : selectedChat.chatName?.toUpperCase();

  const typingLabel = istyping
    ? selectedChat.isGroupChat
      ? `${typingUser?.name || "Someone"} is typing...`
      : `${sender?.name || "User"} is typing...`
    : "";

  return (
    <Flex w="100%" h="100%" direction="column" fontFamily="Work Sans">
      {/* HEADER */}
      <Flex
        w="100%"
        px={3}
        py={2}
        align="center"
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <IconButton
          display={{ base: "flex", md: "none" }}
          aria-label="Back"
          variant="ghost"
          onClick={() => setSelectedChat(null)}
        >
          <IoArrowBack />
        </IconButton>

        {!selectedChat.isGroupChat && sender && (
          <Avatar size="sm" name={sender.name} src={sender.pic} mr={2} />
        )}

        <Text
          fontSize={{ base: "22px", md: "26px" }}
          fontWeight="600"
          noOfLines={1}
          ml={{ base: 1, md: 0 }}
        >
          {title}
        </Text>

        <Spacer />

        {selectedChat.isGroupChat ? (
          <UpdateGroupChatModal
            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain}
            fetchMessages={fetchMessages}
          />
        ) : sender ? (
          <ProfileModal user={sender}>
            <IconButton
              aria-label="View Profile"
              size="sm"
              variant="subtle"
              borderRadius="md"
            >
              <AiOutlineEye />
            </IconButton>
          </ProfileModal>
        ) : null}
      </Flex>

      {/* BODY */}
      <Box
        w="100%"
        flex="1"
        h="100%"
        minH={0}
        p={3}
        bg="white"
        display="flex"
        flexDir="column"
      >
        {selectedChat.isGroupChat ? (
          <Text
            fontSize="sm"
            fontWeight="600"
            color="gray.500"
            letterSpacing="0.08em"
            mb={2}
          >
            {selectedChat.chatName?.toUpperCase()}
          </Text>
        ) : null}

        <Box
          flex="1"
          minH={0}
          p={3}
          bg="#E8E8E8"
          borderRadius="lg"
          display="flex"
          flexDir="column"
          overflow="hidden"
        >
          {loading ? (
            <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
          ) : (
            <div className="messages">
              <ScrolabelChat messages={messages} />
            </div>
          )}

          <Box mt={2}>
            {istyping && typingLabel && (
              <Text fontSize="xs" color="gray.600" mb={1}>
                {typingLabel}
              </Text>
            )}

            <Input
              variant="subtle"
              bg="gray.200"
              placeholder="Enter a message.."
              value={newMessage}
              onChange={typingHandler}
              onKeyDown={sendMessage}
            />
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default SingleChat;
