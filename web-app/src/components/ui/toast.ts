import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function showToastError(message: string) {
  toast.error(message, { position: "top-right" });
}

export function showToastSuccess(message: string) {
  toast.success(message, { position: "top-right" });
}
