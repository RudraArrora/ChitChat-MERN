import { ChatState } from "@/Context/ChatProvider";
import MyChat from "@/component/MyChat";
import ChatBox from "@/component/ChatBox";
import SideDrawer from "@/component/mics/SideDrawer";
import { Box } from "@chakra-ui/react";
import { useState } from "react";

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="stretch"
        w="100%"
        h="91.5vh"
        p="10px"
        gap="10px"
      >
        {user && (
          <MyChat fetchAgain={fetchAgain}/>
        )}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default ChatPage;
