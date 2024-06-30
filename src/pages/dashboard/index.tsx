import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <h1>Welcome to the HALP Dashboard</h1>
      <p>Here you can quickly add content to your story, update your identity, track your campaigns, set up your wallets for receiving funds, and more!</p>
    </DashboardLayout>
  );
};

export default DashboardPage;