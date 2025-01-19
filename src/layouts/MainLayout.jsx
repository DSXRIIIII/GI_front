import React from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const MainContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const MainLayout = () => {
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default MainLayout;