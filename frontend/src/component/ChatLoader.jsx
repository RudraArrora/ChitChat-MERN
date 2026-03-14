import React from 'react'
import { Stack } from '@chakra-ui/react'
import { Skeleton } from '@chakra-ui/react'
const ChatLoader = () => {
  return (
    <Stack>
      <Skeleton height="30px"></Skeleton>
      <Skeleton height="30px"></Skeleton>
      <Skeleton height="30px"></Skeleton>
      <Skeleton height="30px"></Skeleton>
      <Skeleton height="30px"></Skeleton>
      <Skeleton height="30px"></Skeleton>
      <Skeleton height="30px"></Skeleton>
      <Skeleton height="30px"></Skeleton>
      <Skeleton height="30px"></Skeleton>
      <Skeleton height="30px"></Skeleton>
    </Stack>
  );
}

export default ChatLoader