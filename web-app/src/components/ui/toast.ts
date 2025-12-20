import { toast } from "react-toastify";

export function showToastError(message: string) {
  toast.error(message, { position: "top-right" });
}

export function showToastSuccess(message: string) {
  toast.success(message, { position: "top-right" });
}
