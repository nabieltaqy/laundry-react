import React from 'react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 style={{margin:0,fontWeight:700}}>{title}</h2>
          <button onClick={onClose} style={{background:'transparent',border:0,fontSize:18,cursor:'pointer'}}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
