import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  IconButton,
  Button,
  Text,
  Box,
  Input,
  Spinner,
  useDisclosure,
  Flex,
} from "@chakra-ui/react";
import { FiEye } from "react-icons/fi";

import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";
import { toaster } from "@/components/ui/toaster";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const { open: isOpen, onOpen, onClose, setOpen } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const { selectedChat, setSelectedChat, user } = ChatState();

  const safeToggleFetchAgain = () => {
    if (typeof setFetchAgain === "function") setFetchAgain((prev) => !prev);
  };

  const safeFetchMessages = () => {
    if (typeof fetchMessages === "function") fetchMessages();
  };

  const handleSearch = async (query) => {
    setSearch(query);

    if (!query?.trim()) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `/api/user?search=${encodeURIComponent(query)}`,
        config
      );
      setSearchResult(data || []);
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: "Failed to load search results",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName?.trim()) return;

    try {
      setRenameLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.put(
        `/api/chat/rename`,
        { chatId: selectedChat._id, chatName: groupChatName.trim() },
        config
      );

      setSelectedChat(data);
      safeToggleFetchAgain();
      setGroupChatName("");

      // ✅ fetch messages after rename (like old code behavior)
      safeFetchMessages();
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: error?.response?.data?.message || "Rename failed",
      });
    } finally {
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (selectedChat?.users?.find((u) => u._id === userToAdd._id)) {
      toaster.create({ title: "User Already in group!" });
      return;
    }

    if (selectedChat?.groupAdmin?._id !== user?._id) {
      toaster.create({ title: "Only admins can add someone!" });
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.put(
        `/api/chat/groupadd`,
        { chatId: selectedChat._id, userId: userToAdd._id },
        config
      );

      setSelectedChat(data);
      safeToggleFetchAgain();

      // ✅ fetch messages after add user (optional but matches your ask)
      safeFetchMessages();
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: error?.response?.data?.message || "Failed to add user",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userToRemove) => {
    if (
      selectedChat?.groupAdmin?._id !== user?._id &&
      userToRemove?._id !== user?._id
    ) {
      toaster.create({ title: "Only admins can remove someone!" });
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.put(
        `/api/chat/groupremove`,
        { chatId: selectedChat._id, userId: userToRemove._id },
        config
      );

      if (userToRemove._id === user._id) {
        setSelectedChat(null);
        onClose();
      } else {
        setSelectedChat(data);
      }

      safeToggleFetchAgain();

      // ✅ same as old code
      safeFetchMessages();
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: error?.response?.data?.message || "Failed to remove user",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Top right icon */}
      <IconButton
        aria-label="Update Group"
        size="sm"
        variant="ghost"
        onClick={onOpen}
        bg={isOpen ? "black" : "transparent"}
        color={isOpen ? "white" : "black"}
        _hover={{ bg: "black", color: "white" }}
        _active={{ bg: "black", color: "white" }}
      >
        <FiEye />
      </IconButton>

      <Dialog.Root
        open={isOpen}
        onOpenChange={(d) => setOpen(d.open)}
        placement="center"
      >
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            w="95vw"
            maxW="560px"
            borderRadius="xl"
            p={6}
            bg="white"
            boxShadow="2xl"
          >
            <Dialog.CloseTrigger />

            {/* Title centered like screenshot */}
            <Dialog.Header p={0} mb={4}>
              <Dialog.Title
                textAlign="center"
                fontSize="32px"
                fontWeight="600"
                fontFamily="Work Sans"
              >
                {selectedChat?.chatName || "Updated Group"}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body p={0}>
              {/* Badges row */}
              <Box
                w="100%"
                display="flex"
                flexWrap="wrap"
                gap={2}
                justifyContent="center"
                mb={4}
              >
                {selectedChat?.users?.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    admin={selectedChat.groupAdmin}
                    handleFunction={() => handleRemove(u)}
                  />
                ))}
              </Box>

              {/* Rename row: input + update button */}
              <Flex gap={2} mb={3}>
                <Input
                  placeholder="Chat Name"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                  bg="white"
                  color="black"
                  borderColor="gray.300"
                  _placeholder={{ color: "gray.400" }}
                  _focusVisible={{ borderColor: "teal.500" }}
                />
                <Button
                  colorPalette="teal"
                  onClick={handleRename}
                  loading={renameLoading}
                  px={6}
                >
                  Update
                </Button>
              </Flex>

              {/* Add user input */}
              <Input
                placeholder="Add User to group"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                bg="white"
                color="black"
                borderColor="gray.300"
                _placeholder={{ color: "gray.400" }}
                _focusVisible={{ borderColor: "teal.500" }}
              />

              {/* Search results */}
              <Box mt={3} maxH="220px" overflowY="auto" pr={1}>
                {loading ? (
                  <Box py={6} display="flex" justifyContent="center">
                    <Spinner size="lg" />
                  </Box>
                ) : (
                  searchResult?.map((u) => (
                    <UserListItem
                      key={u._id}
                      user={u}
                      handleFunction={() => handleAddUser(u)}
                    />
                  ))
                )}

                {!loading && search && searchResult?.length === 0 ? (
                  <Text
                    fontSize="sm"
                    color="gray.500"
                    mt={2}
                    textAlign="center"
                  >
                    No users found
                  </Text>
                ) : null}
              </Box>
            </Dialog.Body>

            {/* Footer: leave group button bottom-right */}
            <Dialog.Footer p={0} mt={5} justifyContent="flex-end">
              <Button
                colorPalette="red"
                onClick={() => handleRemove(user)}
                loading={loading}
                px={8}
              >
                Leave Group
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};

export default UpdateGroupChatModal;
