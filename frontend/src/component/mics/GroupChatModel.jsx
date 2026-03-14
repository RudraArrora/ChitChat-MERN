import React, { useState } from "react";
import axios from "axios";
import { Toaster, toaster } from "@/components/ui/toaster";
import { ChatState } from "@/Context/ChatProvider";
import "./GroupChatModal.css";
import UserListItem from "../UserAvatar/UserListItem";
import { Badge } from "@chakra-ui/react";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import { Box } from "@chakra-ui/react";
const GroupChatModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]); // Clear previous search results when query is empty
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${query}`, config); // Use 'query' directly
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      setLoading(false);
      toaster.create({
        title: "Error Occurred!",
        description: "Failed to load the search results. Please try again.",
      });
    }
  };

const handleSubmit = async () => {
  // ✅ selectedUsers should be checked with length
  if (!groupChatName || selectedUsers.length === 0) {
    toaster.create({
      title: "Please fill all the fields",
      description: "Enter a group name and add at least 1 user.",
      duration: 2500,
    });
    return;
  }

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.post(
      `/api/chat/group`,
      {
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      },
      config
    );

    setChats([data, ...chats]);
    onClose();

    toaster.create({
      title: "New Group Chat Created!",
      description: `${groupChatName} created successfully.`,
      duration: 2500,
    });
  } catch (error) {
    toaster.create({
      title: "Failed to Create the Chat!",
      description:
        error?.response?.data || error.message || "Something went wrong",
      duration: 3000,
    });
  }
};
const handleDelete = (delUser) => {
  setSelectedUsers((prev) => prev.filter((sel) => sel._id !== delUser._id));
};
  const handleGroup = (userToAdd) => {
    const alreadyAdded = selectedUsers.some((u) => u._id === userToAdd._id); // ✅ safer than includes for objects

    if (alreadyAdded) {
      toaster.create({
        title: "Already added",
        description: `${userToAdd.name} is already in the group.`,
        duration: 2500,
      });
      return;
    }

    setSelectedUsers((prev) => [...prev, userToAdd]);
  };
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      {/* Modal Structure */}
      {isOpen && (
        <div className="modal">
          <div className="modal-overlay" onClick={onClose}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Group Chat</h2>
            </div>
            <div className="modal-close-btn" onClick={onClose}>
              X
            </div>
            <div className="modal-body">
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Chat Name"
                  className="input"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
              </div>
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Add Users eg: John, Piyush, Jane"
                  className="input"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <Box w="100%" display="flex" flexWrap="wrap" mt={2}>
                {selectedUsers.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    admin={user?._id}
                    handleFunction={handleDelete} // ✅ click blue badge -> delete
                  />
                ))}
              </Box>

              {loading ? (
                <div>Loading...</div>
              ) : (
                searchResult
                  .slice(0, 4)
                  .map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleGroup(user)}
                    ></UserListItem>
                  ))
              )}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={handleSubmit}>
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;
