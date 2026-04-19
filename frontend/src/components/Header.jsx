import React, { useState } from 'react';
import { Layout, Space, Badge, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';

const Header = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const showNotificationsHandler = () => {
    setShowNotifications(true);
  };

  return (
    <Layout.Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        padding: "0 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* ... existing logo and menu ... */}

      <Space>
        <Badge count={unreadCount} size="small">
          <Button
            type="text"
            icon={
              <BellOutlined
                style={{
                  fontSize: "20px",
                  transition: "all 0.3s ease",
                }}
              />
            }
            onClick={showNotificationsHandler}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              borderRadius: "50%",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              const bell = e.currentTarget.querySelector('.anticon-bell');
              bell.style.transform = 'rotate(15deg)';
              bell.style.color = '#1890ff';
            }}
            onMouseLeave={(e) => {
              const bell = e.currentTarget.querySelector('.anticon-bell');
              bell.style.transform = 'rotate(0deg)';
              bell.style.color = '';
            }}
          />
        </Badge>
        {/* ... existing user menu ... */}
      </Space>

      {/* ... existing notification drawer ... */}
    </Layout.Header>
  );
};

export default Header; 