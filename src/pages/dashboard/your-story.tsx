// pages/your-story.tsx
import React from 'react';
import ContentManager from '../../components/ContentManager';

const YourStory: React.FC = () => {
  return (
    <ContentManager
      contentType="story"
      headerTitle="Your Story"
      headerDescription="Building momentum around your cause starts with your story. Use the story cards below to share yours inside the donation frame where it will have maximum impact."
    />
  );
};

export default YourStory;
