import React, { useState } from "react";
import { FaBell, FaChevronDown, FaSearch } from "react-icons/fa";
import { ChatState } from "../../Context/ChatProvider";
import "./SideDrawer.css";
import ProfileModal from "./ProfileModal";
import ChatLoader from "../ChatLoader";
import UserListItem from "../UserAvatar/UserListItem";
import { useHistory } from "react-router-dom";
import { toaster } from "@/components/ui/toaster"; // Keep the existing toaster import
import { Spinner } from "@chakra-ui/react";
import {
  DrawerRoot,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseTrigger,
  Input,
  Button,
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";

export default function SideDrawer() {
  const { setSelectedChat, user, chats, setChats, notification, setNotification } =
    ChatState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false); // This is for controlling the spinner visibility
  const history = useHistory();

  const { open, onOpen, onClose } = useDisclosure(); // Chakra UI v3

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) return; // Exit early if search input is empty

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`, // Ensure "Bearer" is correct
        },
      };

      // Make the API call to search for users
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      console.log(data); // Log the response data

      setLoading(false);
      if (Array.isArray(data)) {
        setSearchResult(data); // Ensure that data is an array before setting
      } else {
        setSearchResult([]); // In case of unexpected data format
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching search results:", error);

      // Use toaster.create() to show the toast
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message ||
          "An error occurred while fetching the users.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true); // Set loading to true when starting the chat access
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`, // Ensure "Bearer" is correct
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setLoadingChat(false); // Set loading to false when chat access is complete
      onClose();
    } catch (error) {
      setLoadingChat(false); // Set loading to false on error as well

      // Use toaster.create() to show the toast
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message ||
          "An error occurred while accessing the chat.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif?.chat) return;

    // open the chat where this notification came from
    if (!chats.find((c) => c._id === notif.chat._id)) {
      setChats([notif.chat, ...chats]);
    }
    setSelectedChat(notif.chat);

    // remove this notification
    setNotification((prev) => prev.filter((n) => n._id !== notif._id));
  };

  return (
    <>
      <div className="sd-bar">
        {/* Open drawer on click */}
        <button className="sd-btn" type="button" onClick={onOpen}>
          <FaSearch />
          <span className="sd-searchText">Search User</span>
        </button>

        <div className="sd-title">Talk-A-Tive</div>

        <div className="sd-right">
          <div className="sd-popover">
            <button className="sd-btn sd-bellBtn" type="button" aria-label="notifications">
              <FaBell />
              {notification?.length > 0 && <span className="sd-badge" />}
            </button>
            <div className="sd-dropdown">
              {notification && notification.length > 0 ? (
                notification.map((notif) => (
                  <div
                    key={notif._id}
                    className="sd-item"
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <strong>
                      {notif.chat?.isGroupChat
                        ? notif.chat.chatName
                        : notif.sender?.name || "New message"}
                    </strong>
                    {notif.content && (
                      <span>
                        {": "}
                        {notif.content.length > 30
                          ? `${notif.content.slice(0, 30)}...`
                          : notif.content}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="sd-item sd-muted">No New Messages</div>
              )}
            </div>
          </div>

          <div className="sd-popover">
            <button
              className="sd-avatarBtn"
              type="button"
              aria-label="profile-menu"
            >
              <img
                className="sd-avatar"
                src={user?.pic || "https://via.placeholder.com/40"}
                alt={user?.name || "User"}
              />
              <FaChevronDown />
            </button>

            <div className="sd-dropdown">
              <ProfileModal user={user}>
                <div className="sd-item">My Profile</div>
              </ProfileModal>
              <div className="sd-divider" />
              <div className="sd-item" onClick={logoutHandler}>
                Logout
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chakra v3 Drawer */}
      <DrawerRoot
        open={open}
        placement="left"
        onOpenChange={(e) => (e.open ? onOpen() : onClose())}
      >
        <DrawerBackdrop />
        <DrawerContent maxW="360px" h="100vh" bg="white">
          <DrawerCloseTrigger />
          <DrawerHeader>Search Users</DrawerHeader>

          <DrawerBody>
            <Box display="flex" gap="10px" pt="12px">
              <Input
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                placeholder="Search by name or email"
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>

            {loading ? (
              <ChatLoader />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)} // Placeholder function
                />
              ))
            )}

            {/* Show the Spinner if loadingChat is true */}
            {loadingChat && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mt={4}
              >
                <Spinner size="xl" color="teal.500" />
              </Box>
            )}
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </>
  );
}
