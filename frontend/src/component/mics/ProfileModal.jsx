import React, { useState } from "react";
import "./ProfileModal.css";

const ProfileModal = ({ user, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <span
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        style={{ display: "block" }}
      >
        {children}
      </span>

      {/* Modal */}
      {open && (
        <div
          className="pm-backdrop"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setOpen(false)}
        >
          <div className="pm-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="pm-header">
              <div className="pm-title">{user?.name || "User"}</div>
              <button
                className="pm-close"
                onClick={() => setOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="pm-body">
              <img
                className="pm-avatar"
                src={user?.pic || ""}
                alt={user?.name || "User"}
              />
              <div className="pm-email">Email: {user?.email || "-"}</div>
            </div>

            <div className="pm-footer">
              <button
                className="pm-btn"
                onClick={() => setOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModal;
