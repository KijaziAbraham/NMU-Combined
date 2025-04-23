// components/ui/dialog.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export function Dialog({ children, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full">
        {children}
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function DialogTrigger({ children, onClick }) {
  return (
    <button onClick={onClick} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
      {children}
    </button>
  );
}

export function DialogHeader({ children }) {
  return <div className="mb-4 text-lg font-semibold">{children}</div>;
}

export function DialogContent({ children }) {
  return <div className="text-sm text-gray-700">{children}</div>;
}

export function DialogFooter({ children }) {
  return <div className="mt-4 flex justify-end space-x-2">{children}</div>;
}

Dialog.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

DialogTrigger.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};

DialogHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

DialogContent.propTypes = {
  children: PropTypes.node.isRequired,
};

DialogFooter.propTypes = {
  children: PropTypes.node.isRequired,
};
