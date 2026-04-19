import React, { useState } from 'react';
import { Layout, Space, Badge, Button, Title } from 'antd';
import { BellOutlined, LogoutOutlined } from '@ant-design/icons';
import logo from '../../assets/logo.png';

const Header = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const showNotifications = () => {
    // Implementation of showNotifications function
  };

  const handleLogout = () => {
    // Implementation of handleLogout function
  };

  return (
    <Layout.Header style={{ 
      background: "#fff", 
      padding: "0 24px", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={logo} alt="Logo" style={{ height: "40px", marginRight: "16px" }} />
        <Title level={4} style={{ margin: 0 }}>Öğrenci Bilgi Sistemi</Title>
      </div>
      <Space>
        <Badge count={unreadCount} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: "20px" }} />}
            onClick={showNotifications}
            style={{
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(15deg)';
              e.currentTarget.style.color = '#1890ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg)';
              e.currentTarget.style.color = '';
            }}
          />
        </Badge>
        <Button 
          type="text" 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          style={{
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ff4d4f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '';
          }}
        >
          Çıkış Yap
        </Button>
      </Space>
    </Layout.Header>
  );
};

export default Header; 