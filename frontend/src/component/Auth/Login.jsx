import React, { useState } from "react";
import { Button, Input, InputGroup, VStack, Field } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatState } from "@/Context/ChatProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const { setUser } = ChatState();
  const handleClick = () => setShow((s) => !s);

  const submitHandler = async () => {
    if (!email || !password) {
      toaster.create({ title: "Please fill all the fields", type: "warning" });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: { "Content-Type": "application/json" },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toaster.create({ title: "Login successful", type: "success" });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data); // update context so chat page shows new user immediately (no refresh needed)
      history.push("/chats");
    } catch (error) {
      toaster.create({
        title: "Login failed",
        description: error?.response?.data?.message || error?.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />

      <VStack gap="8px">
        <Field.Root required>
          <Field.Label>Email</Field.Label>
          <Input
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>Password</Field.Label>
          <InputGroup
            size="md"
            endElement={
              <Button
                h="1.75rem"
                size="sm"
                variant="ghost"
                onClick={handleClick}
              >
                {show ? "Hide" : "Show"}
              </Button>
            }
          >
            <Input
              type={show ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputGroup>
        </Field.Root>

        <Button
          width="100%"
          mt={4}
          colorPalette="blue"
          variant="solid"
          onClick={submitHandler}
          loading={loading}
        >
          Log in
        </Button>

        <Button
          width="100%"
          mt={2}
          colorPalette="red"
          variant="solid"
          onClick={() => {
            setEmail("guest@example.com");
            setPassword("123456");
          }}
          disabled={loading}
        >
          As a guest
        </Button>
      </VStack>
    </>
  );
};

export default Login;
