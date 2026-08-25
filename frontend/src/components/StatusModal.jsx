import React from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import "./StatusModal.css";

export default function StatusModal({ isOpen, type = "success", title, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="status-modal-overlay" onClick={onClose}>
      <div className="status-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="status-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="status-icon-wrapper">
          {type === "success" && <FaCheckCircle className="status-icon success-icon" />}
          {type === "error" && <FaTimesCircle className="status-icon error-icon" />}
          {type === "info" && <FaInfoCircle className="status-icon info-icon" />}
        </div>

        <h2 className="status-modal-title">{title || (type === "success" ? "Success!" : "Notice")}</h2>
        <p className="status-modal-message">{message}</p>

        <button
          className={`status-modal-btn status-btn-${type}`}
          onClick={onClose}
        >
          {type === "success" ? "Continue" : "Dismiss"}
        </button>
      </div>
    </div>
  );
}
