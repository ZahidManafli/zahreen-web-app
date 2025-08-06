import React, { useEffect, useState } from "react";

export default function Toaster({ message, type = "success", onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-gray-500";

  return (
    <div className={`fixed top-5 right-5 z-50 px-4 py-2 text-white rounded shadow-lg ${bgColor}`}>
      {message}
    </div>
  );
}
