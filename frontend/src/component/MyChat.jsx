import React, { useEffect, useState } from "react";
import { ChatState } from "@/Context/ChatProvider";
import axios from "axios";
import { Toaster, toaster } from "@/components/ui/toaster"; // Import Toaster and toaster
import { Box, Spinner, Text, Stack, Button } from "@chakra-ui/react";
import ChatLoader from "./ChatLoader";
import { getSender } from "@/config/Chatlogic";
import GroupChatModel from "./mics/GroupChatModel";

const MyChat = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { setSelectedChat, user, chats, setChats, selectedChat } = ChatState();

  // Fetch chats with error handling
  const fetchChats = async () => {
    // console.log("Fetching chats...");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`, // Add Bearer token for authorization
        },
      };

      // Check if user.token exists before making the request
      if (!user.token) {
        console.error("User token is missing!");
        return;
      }

      const { data } = await axios.get("/api/chat", config);
      // console.log("Fetched chats data:", data);
      setChats(data); // Set chats state with the data from the API
    } catch (error) {
      console.error("Error occurred while fetching chats:", error);

      // Create a toast notification using toaster.create on error
      toaster.create({
        title: "Error Occurred!",
        description: "Failed to load the chats",
        status: "error", // Error status for the toast
        duration: 5000, // Toast will disappear after 5 seconds
        isClosable: true, // Allow closing the toast manually
        position: "bottom-left", // Position the toast at the bottom-left of the screen
      });
    }
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setLoggedUser(userInfo);
    if (userInfo) {
      // console.log("Logged user:", userInfo);
      fetchChats(); // Fetch chats when user data is set
    } else {
      console.error("No user data found in localStorage");
    }
  }, [fetchAgain]);

  return (
    <Box
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      h="100%"
      minH={0}
      overflowY="auto"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModel>
          <Button
            variant="surface"
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            marginLeft="90px"
          >
            {" "}
            New Group Chat +
          </Button>
        </GroupChatModel>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll" spacing={2}>
            {chats.map((chat) => {
              const chatName =
                !chat.isGroupChat && loggedUser && chat.users
                  ? getSender(loggedUser, chat.users)
                  : chat.chatName || "";

              const latest = chat.latestMessage;
              const latestSender = latest?.sender?.name;
              const latestContent = latest?.content || "";
              const preview =
                latestContent.length > 40
                  ? `${latestContent.slice(0, 40)}...`
                  : latestContent;

              return (
                <Box
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                  color={selectedChat === chat ? "white" : "black"}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  _hover={{ bg: "#38B2AC", color: "white" }}
                >
                  <Text fontWeight="600" noOfLines={1}>
                    {chatName}
                  </Text>
                  {latest && (
                    <Text fontSize="sm" mt={1} noOfLines={1} opacity={0.8}>
                      {latestSender ? `${latestSender}: ` : ""}
                      {preview}
                    </Text>
                  )}
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoader />
        )}
      </Box>
    </Box>
  );
};

export default MyChat;
