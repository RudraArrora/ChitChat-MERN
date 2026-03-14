import React, { forwardRef } from "react";
import {
  Avatar as ChakraAvatar,
  AvatarGroup as ChakraAvatarGroup,
} from "@chakra-ui/react";

export const Avatar = forwardRef(function Avatar(props, ref) {
  const { name, src, srcSet, loading, icon, fallback, children, ...rest } =
    props;

  return (
    <ChakraAvatar.Root ref={ref} {...rest}>
      <ChakraAvatar.Fallback name={name}>
        {fallback || icon}
      </ChakraAvatar.Fallback>
      <ChakraAvatar.Image src={src} srcSet={srcSet} loading={loading} />
      {children}
    </ChakraAvatar.Root>
  );
});

export const AvatarGroup = ChakraAvatarGroup;
