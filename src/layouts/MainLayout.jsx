import React from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';

const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: 360px 1fr;
  height: 100vh;
  background: #f0f2f5;
`;

const MainContent = styled.div`
  padding: 20px;
  overflow-y: auto;
`;

const MainLayout = ({ children }) => {
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>{children}</MainContent>
    </LayoutContainer>
  );
};

export default MainLayout;