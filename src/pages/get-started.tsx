import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import DashboardLayout from '../components/DashboardLayout';
import { fetchOrCreateEntity } from '../components/supabaseUtils';
import { supabase } from '../components/supabaseClient';

const GetStarted: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { address, isConnected } = useAccount();
  const [entityId, setEntityId] = useState<number | null>(null);
  const [profileCompleted, setProfileCompleted] = useState<boolean>(false);
  const [walletsCompleted, setWalletsCompleted] = useState<boolean>(false);
  const [storyCompleted, setStoryCompleted] = useState<boolean>(false);
  const [fundUsageCompleted, setFundUsageCompleted] = useState<boolean>(false);
  const [campaignsCompleted, setCampaignsCompleted] = useState<boolean>(false);

  useEffect(() => {
    async function checkWallet() {
      if (address && isConnected) {
        try {
          console.log('Fetching or creating entity for wallet:', address);
          const id = await fetchOrCreateEntity(address);
          setEntityId(id);

          // Fetch data from Supabase and set the completion states
          const [
            profileData,
            walletsData,
            storyData,
            fundUsageData,
            campaignsData,
          ] = await Promise.all([
            supabase.from('donation_entities').select('*').eq('id', id).single(),
            supabase.from('donation_entity_wallets').select('*').eq('entity_id', id),
            supabase.from('donations_content_parts').select('*').eq('entity_id', id).eq('content_type', 'story'),
            supabase.from('donations_content_parts').select('*').eq('entity_id', id).eq('content_type', 'funding'),
            supabase.from('donation_campaigns').select('*').eq('entity_id', id),
          ]);

          if(profileData && profileData.data){
            setProfileCompleted(!!profileData.data);
          }
          if(walletsData && walletsData.data){
            setWalletsCompleted(walletsData?.data.length > 0);
          }
          if(storyData && storyData.data){
            setStoryCompleted(storyData?.data.length > 0);
          }
          if(fundUsageData && fundUsageData.data){
            setFundUsageCompleted(fundUsageData?.data.length > 0);
          }
          if(campaignsData && campaignsData.data){
            setCampaignsCompleted(campaignsData?.data.length > 0);
          }
        } catch (error) {
          console.error('Error fetching or creating entity:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('connect a wallet to get started');
        setLoading(false);
      }
    }
    checkWallet();
  }, [address, isConnected]);

  if (loading) return <div>Loading...</div>;
  return (
    <DashboardLayout>
      <div className="container">
        <div className="innerHeader all-purple">
          <h1 className="all-purple">Get HALP raising for your cause</h1>
          <p>To get started we need to know a little about you. Complete each TO DO and you are ready to raise. You may edit this info at any time, in fact we encourage you to keep it fresh!</p>
        </div>
        <div className="divider"></div>
        <section className="get-started-section">
          <div className="section-image thumb">
            <img src="/halp-hand-thumb.png" />
          </div>
          <div className="section-content">
            <h3 className="all-purple">Setup HALP</h3>
            <div className="all-purple">
              <p>Tell us about you and where to flow the raised funds. Your privacy is important to us. We will not share your private information.</p>
              <p>Have handy your FID, and wallet addresses in order to compete these two 3-4 minutes sections.</p>
            </div>
            <div className="steps-container">
              <a className={`btn btn-small ${profileCompleted ? 'status-completed' : 'status-todo'}`} href="/dashboard/identity-profile">Setup Profile</a>
              <a className={`btn btn-small ${walletsCompleted ? 'status-completed' : 'status-todo'}`} href="/dashboard/wallets-and-funds">Add Wallets</a>
            </div>
          </div>
        </section>
        <section className="get-started-section">
          <div className="section-image magic-hands">
            <img src="/help-hand-magic.png" />
          </div>
          <div className="section-content">
            <h3 className="all-purple">Tell Your Story</h3>
            <div className="all-purple">
              <p>Express your cause’s importance and the positive impact donors are making through your action.</p>
              <p>It’s good practice to keep your story updated with recent activities and achievements!</p>
            </div>
            <div className="steps-container">
              <a className={`btn btn-small ${storyCompleted ? 'status-completed' : 'status-todo'}`} href="/dashboard/your-story">Add Your Story</a>
              <a className={`btn btn-small ${fundUsageCompleted ? 'status-completed' : 'status-todo'}`} href="/dashboard/funding-usage">Fund Usage</a>
            </div>
          </div>
        </section>
        <section className="get-started-section">
          <div className="section-image pointer-finger">
            <img src="/halp-hand-point.png" />
          </div>
          <div className="section-content">
            <h3 className="all-purple">Start Raising</h3>
            <div className="all-purple">
              <p>Create meaningful contributions towards your fundraising goals with the power of Warpcaster frames.</p>
              <p>Run as many campaigns as you need, they are free and unlimited.</p>
            </div>
            <div className="steps-container">
              <a className={`btn btn-small ${campaignsCompleted ? 'status-completed' : 'status-todo'}`} href="/dashboard/campaigns">Create Campaign</a>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default GetStarted;
