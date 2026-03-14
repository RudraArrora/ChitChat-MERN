import React from "react";
import { Box, Container, Tabs, Text } from "@chakra-ui/react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useEffect } from "react";
import Login from "@/component/Auth/Login";
import SignUp from "@/component/Auth/SignUp";

function HomePage() {
  const history = useHistory();
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));


    if (userInfo) {
      history.push("/chats");
    }
  }, [history]);
  return (
    <Container maxW="xl" centerContent>
      <Box
        display="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize="4xl" fontFamily="Work sans" color="black">
          Talk-A-Tive
        </Text>
      </Box>

      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs.Root defaultValue="login" fitted variant="subtle">
          <Tabs.List mb="1em">
            <Tabs.Trigger
              value="login"
              flex="1"
              justifyContent="center"
              borderRadius="full"
              _selected={{ bg: "gray.100" }}
              color="black"
            >
              Login
            </Tabs.Trigger>

            <Tabs.Trigger
              value="signup"
              flex="1"
              justifyContent="center"
              borderRadius="full"
              _selected={{ bg: "gray.100" }}
              color="black"
            >
              Sign Up
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="login">
            <Login/>
          </Tabs.Content>

          <Tabs.Content value="signup">
            <SignUp></SignUp>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Container>
  );
}

export default HomePage;
