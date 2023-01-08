import { toast } from "react-toastify";

export default function Account() {
  return (
    <div>
      <h1>Account</h1>
      <button
        onClick={() => {
          toast("Hello World", {
            type: "success",
            autoClose: false,
            closeOnClick: false,
            closeButton: false,
            draggable: false,
          });
        }}
      >
        toast
      </button>
    </div>
  );
}
