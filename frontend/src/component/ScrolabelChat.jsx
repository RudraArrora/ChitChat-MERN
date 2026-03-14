// ScrolabelChat.jsx
import React, { useEffect, useRef } from "react";
import { Box, Text } from "@chakra-ui/react";
import { Avatar } from "./ui/avatar"; // ✅ Chakra v3-safe Avatar wrapper
import { Tooltip } from "./ui/tooltip"; // ✅ Chakra v3-safe Tooltip wrapper

import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/Chatlogic";
import { ChatState } from "../Context/ChatProvider";

const ScrolabelChat = ({ messages = [] }) => {
  const { user } = ChatState();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box overflowY="auto" w="100%" flex="1" pr={1}>
      {messages.map((m, i) => (
        <Box
          key={m._id || i}
          display="flex"
          alignItems="center"  /* center-align avatar and bubble */
        >
          {(isSameSender(messages, m, i, user?._id) ||
            isLastMessage(messages, i, user?._id)) &&
            m.sender && (
              <Tooltip
                content={m.sender.name}
                positioning={{ placement: "bottom-start" }}
                showArrow
              >
                <Avatar
                  mr={2}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}

          <Box
            bg={m.sender?._id === user?._id ? "#BEE3F8" : "#B9F5D0"}
            ml={isSameSenderMargin(messages, m, i, user?._id)}
            mt={isSameUser(messages, m, i, user?._id) ? 2 : 6}
            borderRadius="20px"
            px="15px"
            py="5px"
            maxW="75%"
          >
            <Text fontSize="sm">{m.content}</Text>
          </Box>
        </Box>
      ))}

      <div ref={bottomRef} />
    </Box>
  );
};

export default ScrolabelChat;
