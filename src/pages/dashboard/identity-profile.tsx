import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchOrCreateEntity } from '../../components/supabaseUtils';
import { supabase } from '../../components/supabaseClient';
import EndaomentSetup from '../../components/EndaomentSetup';
import { Profile } from '../../../types/types';

const defaultColors = {
  color_background: '#0049AD',
  color_dark: '#01193A',
  color_shadow: '#00347C',
  color_lightShadow: '#066FFF',
  color_light: '#368BFF',
  color_lightest: '#2A08FF',
  color_altBackground: '#FFCA00',
  color_altDark: '#594600',
  color_altShadow: '#BC9500',
  color_altLightShadow: '#FFD123',
  color_altLight: '#FFCA00',
  color_altLightest: '#FFAC23',
  color_mainText: '#ffffff',
  color_mainTextAlt: '#000'
};

type ColorKey =
  | 'color_background'
  | 'color_dark'
  | 'color_shadow'
  | 'color_lightShadow'
  | 'color_light'
  | 'color_lightest'
  | 'color_altBackground'
  | 'color_altDark'
  | 'color_altShadow'
  | 'color_altLightShadow'
  | 'color_altLight'
  | 'color_altLightest'
  | 'color_mainText'
  | 'color_mainTextAlt';

const colorKeys: ColorKey[] = [
  'color_background',
  'color_dark',
  'color_shadow',
  'color_lightShadow',
  'color_light',
  'color_lightest',
  'color_altBackground',
  'color_altDark',
  'color_altShadow',
  'color_altLightShadow',
  'color_altLight',
  'color_altLightest',
  'color_mainText',
  'color_mainTextAlt'
];

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile>({
    id: undefined,
    name: '',
    email: '',
    wallet: undefined,
    active: false,
    is_non_profit: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const { address, isConnected } = useAccount();
  const [entityId, setEntityId] = useState<number | null>(null);

  const normalizedProfile: Profile = {
    ...profile,
    is_non_profit: profile.is_non_profit ?? false,
  };

  useEffect(() => {
    async function checkWallet() {
      if (address && isConnected) {
        try {
          console.log('Fetching or creating entity for wallet:', address);
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
    const fetchProfile = async () => {
      if (entityId !== null) {
        const { data, error } = await supabase
          .from('donation_entities')
          .select('*')
          .eq('id', entityId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          console.log('Fetched profile data:', data);
          setProfile(data || {});
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [entityId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (e.target instanceof HTMLInputElement && type === 'checkbox') {
      setProfile({
        ...profile,
        [name]: e.target.checked,
      });
    } else {
      setProfile({
        ...profile,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    let error;
    if (profile.id) {
      ({ error } = await supabase
        .from('donation_entities')
        .update(profile)
        .eq('id', profile.id)); // Ensure 'id' is used correctly in the query
    } else {
      ({ error } = await supabase
        .from('donation_entities')
        .insert(profile));
    }
    if (error) {
      console.error('Error submitting profile:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  // Render profile form
  return (
    <DashboardLayout>
      <div className="container">
        <div className="innerHeader all-purple">
          <h1 className="all-purple">Your Profile</h1>
          <p>If you represent an organization, please use the information of an accountable member of the team.  We use the information below to better help you report and capture funds from givers.</p>
        </div>
        <div className="divider"></div>
          <h2 className="all-dark-purple" style={{fontSize: '1.5rem'}}>Add your information directly into the fields below</h2>
          <div className="floating-fields">
            <div className="floating-field">
              <input
                type="text"
                className="floating-input"
                name="email"
                placeholder="Email"
                value={profile.email || ''}
                onChange={handleChange}
              />
              <label>This is assists with non-wallet login recovery</label>
            </div>
            <div className="floating-field">
              <input
                type="text"
                className="floating-input"
                name="wallet"
                placeholder="0x..."
                value={profile.wallet || ''}
                onChange={handleChange}
              />
              <label>This is your preferred wallet address for HALP airdrops</label>
            </div>
            <div className="floating-field">
              <input
                type="text"
                className="floating-input"
                placeholder="Logo/Image"
                name="image"
                value={profile.image || ''}
                onChange={handleChange}
              />
              <label>We will use this Logo throughout the site (250x250px)</label>
            </div>
            <div className="floating-field">
              <input
                type="text"
                className="floating-input"
                name="website"
                placeholder="Website"
                value={profile.website || ''}
                onChange={handleChange}
              />
              <label>This is your cause’s relevant web page</label>
            </div>
            <div className="floating-field">
                <input
                  type="checkbox"
                  name="is_non_profit"
                  className="checkbox-checkbox"
                  checked={profile.is_non_profit || false}
                  onChange={handleChange}
                />
                <label className="form-label">
                  Is your cause a registered 501(c)(3) Non-Profit?
                </label>
            </div>
            {(profile.is_non_profit) && (
              <div>
                {entityId && <EndaomentSetup entityId={String(entityId)} profile={profile} />}
              </div>
            )}
          </div>
          <div className="divider"></div>
          <button className="btn" type="button" onClick={handleSubmit}>
            Save
          </button>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
