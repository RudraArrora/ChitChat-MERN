import React, { useState } from "react";
import { Button, Input, InputGroup, VStack, Field } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatState } from "@/Context/ChatProvider";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const { setUser } = ChatState();
  const handleClick = () => setShow((s) => !s);

  const postDetails = async (file) => {
    if (!file) return;

    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/jpg" &&
      file.type !== "image/png"
    ) {
      toaster.create({
        title: "Please select a JPEG/PNG image",
        type: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "chat_app");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dzeddl0ui/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Upload failed");

      setPic(json.secure_url);
      toaster.create({ title: "Image uploaded", type: "success" });
    } catch (e) {
      console.log("Upload error:", e);
      toaster.create({ title: e.message || "Upload failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toaster.create({ title: "Please fill all the fields", type: "warning" });
      return;
    }

    if (password !== confirmPassword) {
      toaster.create({ title: "Passwords do not match", type: "warning" });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

   

      const { data } = await axios.post(
        "/api/user",
        { name, email, password, pic },
        config
      );
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data); // update context so chat page shows new user immediately (no refresh needed)
      toaster.create({ title: "Registration successful", type: "success" });

      // redirect to chats page (same as Login)
      history.push("/chats");
    } catch (error) {
      console.log("Register error:", error);
      toaster.create({
        title:
          error?.response?.data?.message ||
          error?.message ||
          "Registration failed",
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
          <Field.Label>Name</Field.Label>
          <Input
            placeholder="Enter Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field.Root>

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

        <Field.Root required>
          <Field.Label>Confirm Password</Field.Label>
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
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </InputGroup>
        </Field.Root>

        <Field.Root>
          <Field.Label>Upload your Picture</Field.Label>
          <Input
            type="file"
            p={1.5}
            accept="image/*"
            onChange={(e) => postDetails(e.target.files?.[0])}
            disabled={loading}
          />
        </Field.Root>

        <Button
          width="100%"
          mt={4}
          colorPalette="blue"
          variant="solid"
          onClick={submitHandler}
          loading={loading}
        >
          Sign Up
        </Button>
      </VStack>
    </>
  );
};

export default SignUp;
