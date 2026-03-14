import { Badge } from "@chakra-ui/react";

const UserBadgeItem = ({ user, admin, handleFunction }) => {
  return (
    <Badge
      px={4}
      py={2}
      m={1}
      borderRadius="full"
      variant="solid"
      fontSize="13px"
      fontWeight="600"
      letterSpacing="0.2px"
      colorScheme="purple" // ✅ purple background
      cursor="pointer"
      display="inline-flex"
      alignItems="center"
      gap={2}
      boxShadow="sm"
      transition="all 0.15s ease"
      _hover={{
        transform: "translateY(-1px)",
        boxShadow: "md",
        filter: "brightness(1.05)",
      }}
      _active={{
        transform: "scale(0.98)",
        boxShadow: "sm",
      }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "purple.200",
        outlineOffset: "2px",
      }}
      onClick={() => handleFunction(user)}
    >
      {user.name}

      {admin === user._id && (
        <Badge
          ml={1}
          px={2}
          py={0.5}
          borderRadius="full"
          fontSize="10px"
          fontWeight="700"
          colorScheme="whiteAlpha"
          variant="solid"
        >
          Admin
        </Badge>
      )}
    </Badge>
  );
};

export default UserBadgeItem;
