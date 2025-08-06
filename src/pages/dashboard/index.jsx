import { useEffect, useState } from "react";
import axios from "axios";
import Toaster from "../../components/Toaster";
import { ToastContainer, toast } from "react-toastify";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   // notify(`Xoş gəldin ${user.first_name + " " + user.last_name}`);

  //   if (token) {
  //     axios
  //       .get("http://167.86.97.169/zahren/api/profile/", {
  //         headers: {
  //           Authorization: `Token ${token}`,
  //         },
  //       })
  //       .then((res) => {
  //         const user = res.data;
  //         setUsername(user.username);
  //         setToastVisible(true); // toasteri göstər
  //       })
  //       .catch((err) => {
  //         console.error("İstifadəçi məlumatı alınmadı", err);
  //       });
  //   }
  // }, []);

  const notify = (value) => toast.success(value);

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold text-black">Dashboard</h1>

      <button className="text-black" onClick={notify}>
        Click me
      </button>

      {username && (
        <p className="mt-4 text-gray-700">
          Salam, <span className="font-semibold">{username}</span>!
        </p>
      )}
    </div>
  );
}
