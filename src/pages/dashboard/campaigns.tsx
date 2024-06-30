import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../../components/supabaseClient';
import { fetchOrCreateEntity } from '../../components/supabaseUtils';
import DashboardLayout from '../../components/DashboardLayout';
import dayjs, { Dayjs } from 'dayjs';

interface Campaign {
  id: number;
  fid?: string;
  wallet?: string;
  username?: string;
  is_nonprofit?: boolean;
  website: string;
  name: string;
  donations_goal: number;
  campaign_start: Dayjs | null;
  campaign_end: Dayjs | null;
  donations_amount: number;
  donations_amount_degen_tips: number;
  donations_amount_usdc: number;
  entity_id: number | null;
  is_active: boolean;
  is_deleted?: boolean;
}

interface CampaignData {
  donations_amount: number;
  donations_amount_degen_tips: number;
  donations_amount_usdc: number;
  donations_goal: number;
}

interface Prices {
  ethPrice: number;
  degenPrice: number;
}

const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState<{ [id: number]: string }>({});
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { address, isConnected } = useAccount();
  const [entityId, setEntityId] = useState<number | null>(null);

  const emptyCampaign: Campaign = {
    id: 0, // Temporary ID, replace it later when saving
    website: '',
    name: '',
    donations_goal: 0,
    campaign_start: dayjs(), // Default to current time
    campaign_end: dayjs().add(1, 'month'), // Default to one month later
    donations_amount: 0,
    donations_amount_degen_tips: 0,
    donations_amount_usdc: 0,
    entity_id: entityId,
    is_active: false,
  };

  useEffect(() => {
    async function checkWallet() {
      if (address && isConnected) {
        try {
          const id = await fetchOrCreateEntity(address);
          setEntityId(id);
        } catch (error) {
          console.error('Error fetching or creating entity:', error);
        }
      }
    }
    checkWallet();
  }, [address, isConnected]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (entityId !== null) {
        const { data, error } = await supabase
          .from('donation_campaigns')
          .select('*')
          .eq('entity_id', entityId)
          .eq('is_deleted', false);

        if (error) {
          console.error('Error fetching campaigns:', error);
        } else {
          setCampaigns(data.map(campaign => ({
            ...campaign,
            campaign_start: campaign.campaign_start ? dayjs(campaign.campaign_start) : null,
            campaign_end: campaign.campaign_end ? dayjs(campaign.campaign_end) : null,
            donations_amount: campaign.donations_amount || 0,
            donations_amount_degen_tips: campaign.donations_amount_degen_tips || 0,
            donations_amount_usdc: campaign.donations_amount_usdc || 0,
          })));
        }
        setSelectedCampaign(emptyCampaign);
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [entityId]);

  useEffect(() => {
    const calculateTotal = async () => {
      const newTotals: { [id: number]: string } = {};
      for (const campaign of campaigns) {
        const result = await getDonationTotal({
          donations_amount: campaign.donations_amount,
          donations_amount_degen_tips: campaign.donations_amount_degen_tips,
          donations_amount_usdc: campaign.donations_amount_usdc,
          donations_goal: campaign.donations_goal
        });
        newTotals[campaign.id] = result;
      }
      setTotal(newTotals);
    };

    calculateTotal();
  }, [campaigns]);

  const fetchPrices = async (): Promise<Prices> => {
    const { data, error } = await supabase
      .from('halp_constants')
      .select('h_key, h_value')
      .in('h_key', ['eth_price', 'degen_price']);

    if (error) {
      throw new Error(`Failed to fetch prices from halp_constants: ${error.message}`);
    }

    const prices = data.reduce((acc: { [key: string]: number }, item: { h_key: string, h_value: string }) => {
      acc[item.h_key] = parseFloat(item.h_value);
      return acc;
    }, {});

    return {
      ethPrice: prices.eth_price,
      degenPrice: prices.degen_price
    };
  };

  const getDonationTotal = async (campaignData: CampaignData): Promise<string> => {
    try {
      const { ethPrice, degenPrice } = await fetchPrices();
      const donationSum = (
        Math.floor(campaignData.donations_amount * ethPrice) +
        Math.floor(campaignData.donations_amount_degen_tips * degenPrice) +
        campaignData.donations_amount_usdc
      );

      const percentRaised = ((donationSum / campaignData.donations_goal) * 100).toFixed(1);
      return percentRaised;
    } catch (error) {
      console.error('Error fetching or calculating donation total:', error);
      return '0'; // Return '0' if there's an error
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (e.target instanceof HTMLInputElement && type === 'checkbox') {
      const { checked } = e.target;
      setSelectedCampaign(prevState => {
        if (!prevState) return prevState; // Return prevState if it's null

        return {
          ...prevState,
          [name]: checked,
        };
      });
    } else {
      setSelectedCampaign(prevState => {
        if (!prevState) return prevState; // Return prevState if it's null

        return {
          ...prevState,
          [name]: value,
        };
      });
    }
  };

  const handleDateChange = (name: string, value: Dayjs | null) => {
    setSelectedCampaign(prevState => ({
      ...prevState,
      [name]: value,
    } as Campaign));
  };

  const handleSave = async (isActive: boolean) => {
    if (selectedCampaign) {
      const { id, ...campaignData } = selectedCampaign;
      const { data, error } = id
        ? await supabase
          .from('donation_campaigns')
          .update({
            ...campaignData,
            is_active: isActive,
            campaign_start: campaignData.campaign_start ? campaignData.campaign_start.toISOString() : null,
            campaign_end: campaignData.campaign_end ? campaignData.campaign_end.toISOString() : null,
          })
          .eq('id', id)
          .select()
        : await supabase
          .from('donation_campaigns')
          .insert([{
            ...campaignData,
            entity_id: entityId,
            is_active: isActive,
            campaign_start: campaignData.campaign_start ? campaignData.campaign_start.toISOString() : null,
            campaign_end: campaignData.campaign_end ? campaignData.campaign_end.toISOString() : null,
          }])
          .select();

      if (error) {
        console.error('Error saving campaign:', error);
      } else {
        const updatedCampaign = data[0];
        setCampaigns(prevCampaigns => id
          ? prevCampaigns.map(c => c.id === id ? updatedCampaign : c)
          : [...prevCampaigns, updatedCampaign]
        );
        setSelectedCampaign(emptyCampaign);
      }
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('donation_campaigns')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) {
      console.error('Error deleting campaign:', error);
    } else {
      setCampaigns(prevCampaigns => prevCampaigns.filter(c => c.id !== id));
    }
  };

  const copyToClipboard = (id: number) => {
    const url = `https://sendhalp.framesframes.xyz/api?frameId=${id}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('Frame URL copied to clipboard. Post on Farcaster to use.');
        console.log('URL copied to clipboard:', url);
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
      });
  };

  if (loading) return <div>Loading...</div>;

  const currentDate = dayjs();

  const activeCampaigns = campaigns.filter(campaign => campaign.is_active && campaign.campaign_start && campaign.campaign_end && currentDate.isAfter(campaign.campaign_start) && currentDate.isBefore(campaign.campaign_end));
  const draftCampaigns = campaigns.filter(campaign => !campaign.is_active);
  const pastCampaigns = campaigns.filter(campaign => campaign.campaign_end && currentDate.isAfter(campaign.campaign_end));

  return (
    <DashboardLayout>
      <div className="container">
        <div className="innerHeader all-purple">
          <h1 className="all-purple">Your Campaigns</h1>
          <p>Being ever-present and keeping things fresh has never been more important. Think of each campaign as a stepping stone towards reaching your biggest fundraising goals.</p>
        </div>
        <div className="divider"></div>
        <div className="card">
          <div className="card-half bigger">
            <div className="large-field">
              <input
                type="text"
                name="name"
                placeholder="Campaign Name"
                required
                value={selectedCampaign?.name || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="columns apart tight">
              <div className="column">
                <div className="new-field">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    name="campaign_start"
                    required
                    value={selectedCampaign?.campaign_start ? selectedCampaign.campaign_start.format('YYYY-MM-DD') : ''}
                    onChange={(e) => handleDateChange('campaign_start', dayjs(e.target.value))}
                  />
                </div>
                <div className="new-field">
                  <label>End Date:</label>
                  <input
                    type="date"
                    name="campaign_end"
                    required
                    value={selectedCampaign?.campaign_end ? selectedCampaign.campaign_end.format('YYYY-MM-DD') : ''}
                    onChange={(e) => handleDateChange('campaign_end', dayjs(e.target.value))}
                  />
                </div>
              </div>
              <div className="column">
                <div className="new-field">
                  <label>Funding Goal:</label>
                  <input
                    type="number"
                    name="donations_goal"
                    required
                    value={selectedCampaign?.donations_goal || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="card-half smaller right-aligned">
            <button className="btn btn-small" onClick={() => handleSave(true)}>Publish Campaign</button>
            <button className="btn secondary btn-small" onClick={() => handleSave(false)}>Save As Draft</button>
          </div>
        </div>
        <div className="divider"></div>
        <h3 className="all-purple">Active Campaigns</h3>
        <div className="grid">
          {activeCampaigns.map((campaign) => (
            <div className="card" key={campaign.id}>
              <div className="card-half">
                <h2 className="dark-text">{campaign.name}</h2>
                <div className="columns">
                  <div className="column">
                    <p>Start: <span className="dark-text">{campaign.campaign_start ? dayjs(campaign.campaign_start).format('MMMM D, YYYY h:mm A') : 'N/A'}</span></p>
                    <p>End: <span className="dark-text">{campaign.campaign_end ? dayjs(campaign.campaign_end).format('MMMM D, YYYY h:mm A') : 'N/A'}</span></p>
                  </div>
                  <div className="column">
                    <p>Total Funds Goal: ${campaign.donations_goal ? campaign.donations_goal.toLocaleString() : '0'}</p>
                    <p>Total Funds Raised: ${total[campaign.id] ? total[campaign.id].toLocaleString() : '0'}</p>
                  </div>
                </div>
              </div>
              <div className="card-half right-aligned">
                <button className="btn btn-small" onClick={() => copyToClipboard(campaign.id)}>
                  Copy Frame URL
                </button>
                <button className="btn secondary btn-small" onClick={() => setSelectedCampaign(campaign)}>
                  Edit
                </button>
                <button className="btn secondary btn-small" onClick={() => handleDelete(campaign.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <h3 className="all-purple">Draft Campaigns</h3>
        <div className="grid">
          {draftCampaigns.map((campaign) => (
            <div className="card" key={campaign.id}>
              <div className="card-half">
                <h2 className="dark-text">{campaign.name}</h2>
                <div className="columns">
                  <div className="column">
                    <p>Start: <span className="dark-text">{campaign.campaign_start ? dayjs(campaign.campaign_start).format('MMMM D, YYYY h:mm A') : 'N/A'}</span></p>
                    <p>End: <span className="dark-text">{campaign.campaign_end ? dayjs(campaign.campaign_end).format('MMMM D, YYYY h:mm A') : 'N/A'}</span></p>
                  </div>
                  <div className="column">
                    <p>Total Funds Goal: ${campaign.donations_goal ? campaign.donations_goal.toLocaleString() : '0'}</p>
                    <p>Total Funds Raised: ${total[campaign.id] ? total[campaign.id].toLocaleString() : '0'}</p>
                  </div>
                </div>
              </div>
              <div className="card-half right-aligned">
                <button className="btn btn-small" onClick={() => handleSave(true)}>
                  Publish
                </button>
                <button className="btn secondary btn-small" onClick={() => setSelectedCampaign(campaign)}>
                  Edit
                </button>
                <button className="btn secondary btn-small" onClick={() => handleDelete(campaign.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <h3 className="all-purple">Past Campaigns</h3>
        <div className="grid">
          {pastCampaigns.map((campaign) => (
            <div className="card" key={campaign.id}>
              <div className="card-half">
                <h2 className="dark-text">{campaign.name}</h2>
                <div className="columns">
                  <div className="column">
                    <p>Start: <span className="dark-text">{campaign.campaign_start ? dayjs(campaign.campaign_start).format('MMMM D, YYYY h:mm A') : 'N/A'}</span></p>
                    <p>End: <span className="dark-text">{campaign.campaign_end ? dayjs(campaign.campaign_end).format('MMMM D, YYYY h:mm A') : 'N/A'}</span></p>
                  </div>
                  <div className="column">
                    <p>Total Funds Goal: ${campaign.donations_goal ? campaign.donations_goal.toLocaleString() : '0'}</p>
                    <p>Total Funds Raised: ${total[campaign.id] ? total[campaign.id].toLocaleString() : '0'}</p>
                  </div>
                </div>
              </div>
              <div className="card-half right-aligned">
                <button className="btn secondary btn-small" onClick={() => handleDelete(campaign.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CampaignsPage;
