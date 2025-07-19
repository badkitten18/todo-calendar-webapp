import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable Modal component with backdrop and close functionality
 * @param {object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {function} props.onClose - Function to close modal
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.title - Modal title (optional)
 * @param {string} props.size - Modal size ('sm', 'md', 'lg', 'xl', 'full')
 * @param {boolean} props.closeOnBackdrop - Whether to close on backdrop click
 * @param {boolean} props.closeOnEscape - Whether to close on escape key
 * @param {string} props.className - Additional CSS classes for modal content
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = ''
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Size styles
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full mx-4'
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full ${sizeStyles[size]} ${className} max-h-[90vh] overflow-hidden`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md p-1"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
          {children}
        </div>
      </div>
    </div>
  );

  // Render modal in portal to avoid z-index issues
  return createPortal(modalContent, document.body);
};

/**
 * Modal Header component
 */
export const ModalHeader = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

/**
 * Modal Body component
 */
export const ModalBody = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

/**
 * Modal Footer component
 */
export const ModalFooter = ({ children, className = '' }) => (
  <div className={`p-4 border-t border-gray-200 flex justify-end space-x-2 ${className}`}>
    {children}
  </div>
);

export default Modal;