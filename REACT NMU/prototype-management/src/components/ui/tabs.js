// components/ui/tabs.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export function Tabs({ defaultValue, children }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  // Clone and inject props to children
  const enhancedChildren = React.Children.map(children, child => {
    if (child.type === TabsList) {
      return React.cloneElement(child, { activeTab, setActiveTab });
    }
    if (child.type === TabsContent) {
      return child.props.value === activeTab ? child : null;
    }
    return child;
  });

  return <div>{enhancedChildren}</div>;
}

export function TabsList({ children, activeTab, setActiveTab }) {
  return (
    <div className="flex border-b mb-4 space-x-4">
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
}

export function TabsTrigger({ value, children, activeTab, setActiveTab }) {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={classNames(
        'px-4 py-2 font-medium text-sm rounded-t-lg',
        isActive
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-500 hover:text-gray-700'
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }) {
  return <div className="p-4">{children}</div>;
}

Tabs.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

TabsList.propTypes = {
  children: PropTypes.node.isRequired,
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func,
};

TabsTrigger.propTypes = {
  value: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func,
};

TabsContent.propTypes = {
  value: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
