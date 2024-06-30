// pages/funding-usage.tsx
import React from 'react';
import ContentManager from '../../components/ContentManager';

const FundingUsage: React.FC = () => {
  return (
    <ContentManager
      contentType="funding"
      headerTitle="Funding Usage"
      headerDescription="Building momentum around your cause starts with your story. Use the story cards below to share yours inside the donation frame where it will have maximum impact."
    />
  );
};

export default FundingUsage;
