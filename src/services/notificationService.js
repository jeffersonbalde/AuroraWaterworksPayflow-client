// src/services/notificationService.js
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// SweetAlert2 configurations with your Aurora Waterworks theme
export const showAlert = {
  // Success alert
  success: (title, text = "", timer = 3000) => {
    return Swal.fire({
      title,
      text,
      icon: "success",
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      background: "#fff",
      color: "#336C35", // Your primary color
      iconColor: "#336C35",
    });
  },

  // Error alert
  error: (title, text = "", timer = 4000) => {
    return Swal.fire({
      title,
      text,
      icon: "error",
      timer,
      timerProgressBar: true,
      background: "#fff",
      color: "#336C35",
      confirmButtonColor: "#336C35",
      iconColor: "#dc3545",
    });
  },

  // Warning alert
  warning: (title, text = "", timer = 3000) => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      background: "#fff",
      color: "#336C35",
      iconColor: "#ffc107",
    });
  },

  // Info alert
  info: (title, htmlContent = "", confirmButtonText = "Close", timer = null) => {
    return Swal.fire({
      title,
      html: htmlContent,
      icon: "info",
      timer: timer,
      timerProgressBar: !!timer,
      showConfirmButton: true,
      confirmButtonText,
      confirmButtonColor: "#336C35",
      background: "#fff",
      color: "#336C35",
      width: "450px",
      maxWidth: "95vw",
      padding: "1rem",
      backdrop: true,
    });
  },

  // Confirmation dialog
  confirm: (title, text = "", confirmButtonText = "Yes", cancelButtonText = "Cancel") => {
    return Swal.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#336C35",
      cancelButtonColor: "#6c757d",
      confirmButtonText,
      cancelButtonText,
      background: "#fff",
      color: "#336C35",
      iconColor: "#336C35",
    });
  },

  // Loading alert
  loading: (title = "Loading...") => {
    return Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      background: "#fff",
      color: "#336C35",
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },

  // Close any open alert
  close: () => {
    Swal.close();
  },

  // Custom HTML alert for detailed content
  html: (title, htmlContent, confirmButtonText = "Close", width = 600) => {
    return Swal.fire({
      title,
      html: htmlContent,
      icon: "info",
      showConfirmButton: true,
      confirmButtonText,
      confirmButtonColor: "#336C35",
      background: "#fff",
      color: "#336C35",
      iconColor: "#17a2b8",
      width: `${width}px`,
    });
  },
};

// Toastify configurations with your Aurora Waterworks theme
export const showToast = {
  // Success toast
  success: (message, autoClose = 3000) => {
    toast.success(message, {
      position: "top-right",
      autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      style: {
        background: "#f8fff9",
        color: "#336C35",
        border: "1px solid #d4edda",
        borderRadius: "8px",
        fontWeight: "500",
      },
      progressStyle: {
        background: "#336C35",
      },
    });
  },

  // Error toast
  error: (message, autoClose = 4000) => {
    toast.error(message, {
      position: "top-right",
      autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      style: {
        background: "#fff5f5",
        color: "#dc3545",
        border: "1px solid #f8d7da",
        borderRadius: "8px",
        fontWeight: "500",
      },
      progressStyle: {
        background: "#dc3545",
      },
    });
  },

  // Warning toast
  warning: (message, autoClose = 3000) => {
    toast.warn(message, {
      position: "top-right",
      autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      style: {
        background: "#fffbf0",
        color: "#856404",
        border: "1px solid #ffeaa7",
        borderRadius: "8px",
        fontWeight: "500",
      },
      progressStyle: {
        background: "#ffc107",
      },
    });
  },

  // Info toast
  info: (message, autoClose = 3000) => {
    toast.info(message, {
      position: "top-right",
      autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      style: {
        background: "#f0f9ff",
        color: "#336C35",
        border: "1px solid #e8f0ec",
        borderRadius: "8px",
        fontWeight: "500",
      },
      progressStyle: {
        background: "#336C35",
      },
    });
  },

  // Default toast
  default: (message, autoClose = 3000) => {
    toast(message, {
      position: "top-right",
      autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      style: {
        background: "#f8f9fa",
        color: "#336C35",
        border: "1px solid #e8f0ec",
        borderRadius: "8px",
        fontWeight: "500",
      },
      progressStyle: {
        background: "#336C35",
      },
    });
  },
};

// Export ToastContainer for use in App.jsx
export { ToastContainer } from "react-toastify";