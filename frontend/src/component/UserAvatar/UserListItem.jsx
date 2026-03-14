import React from "react";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <div
      onClick={handleFunction}
      style={{
        cursor: "pointer",
        backgroundColor: "#E8E8E8",
        display: "flex",
        alignItems: "center",
        color: "black",
        padding: "8px 16px",
        marginBottom: "8px",
        borderRadius: "8px",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#38B2AC")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E8E8E8")}
    >
      <img
        src={user?.pic || "https://via.placeholder.com/40"}
        alt={user?.name || "User"}
        style={{
          marginRight: "8px",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
        }}
      />
      <div>
        <span style={{ fontWeight: "bold" }}>
          {user?.name || "Default Name"}
        </span>
        <br />
        <span style={{ fontSize: "12px", color: "#555" }}>
          <b>Email: </b>
          {user?.email || "default@example.com"}
        </span>
      </div>
    </div>
  );
};

export default UserListItem;
