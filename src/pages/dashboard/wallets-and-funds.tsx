// pages/dashboard/wallets-and-funds.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchOrCreateEntity } from '../../components/supabaseUtils';
import { supabase } from '../../components/supabaseClient';

const WalletsAndFunds: React.FC = () => {
  const [wallets, setWallets] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const account = useAccount();
  const { address, isConnected } = useAccount();
  const [newWallet, setNewWallet] = useState('');
  const [entityId, setEntityId] = useState<number | null>(null);
  const newWalletInputRef = useRef<HTMLInputElement>(null);
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
    const fetchWallets = async () => {
      const { data, error } = await supabase
        .from('donation_entity_wallets')
        .select('wallet')
        .eq('entity_id', entityId);

      if (error) {
        console.error('Error fetching wallets:', error);
      } else if (data && data.length > 0) {
        setWallets(data.map((entry: { wallet: string }) => entry.wallet));
      }
      setLoading(false);
    };

    fetchWallets();
  }, [entityId]);

  const handleInputChange = (index: number, value: string) => {
    const updatedWallets = [...wallets];
    updatedWallets[index] = value.trim();
    setWallets(updatedWallets);
    if (value.trim() && !/^0x[a-fA-F0-9]{40}$/.test(value.trim())) {
      setError('One or more wallet addresses are invalid.');
    } else {
      setError(null);
    }
  };

  const handleAddWallet = () => {
    if (newWallet && /^0x[a-fA-F0-9]{40}$/.test(newWallet)) {
      setWallets([...wallets, newWallet]);
      if (newWalletInputRef.current) {
        newWalletInputRef.current.value = ''; // Clear the input
      }
      handleSave();
      setError(null);
    } else {
      setError('Invalid wallet address');
    }
  };

  const handleRemoveWallet = (index: number) => {
    const updatedWallets = wallets.filter((_, i) => i !== index);
    setWallets(updatedWallets.length > 0 ? updatedWallets : ['']);
  };

  const handleSave = async () => {
    const validWallets = wallets.filter(wallet => /^0x[a-fA-F0-9]{40}$/.test(wallet));

    if (validWallets.length !== wallets.length) {
      setError('One or more wallet addresses are invalid.');
      return;
    }

    const { error: deleteError } = await supabase
      .from('donation_entity_wallets')
      .delete()
      .eq('entity_id', entityId);

    if (deleteError) {
      console.error('Error deleting wallets:', deleteError);
      return;
    }

    const { error: insertError } = await supabase
      .from('donation_entity_wallets')
      .insert(validWallets.map(wallet => ({ entity_id: entityId, wallet })));

    if (insertError) {
      console.error('Error inserting wallets:', insertError);
    }
  };

  const downloadJsonFile = () => {
    const validWallets = wallets.filter(wallet => /^0x[a-fA-F0-9]{40}$/.test(wallet));
    if (validWallets.length > 0) {
      const json = JSON.stringify(validWallets.map(wallet => ({ wallet })), null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wallets.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      setError('Cannot download JSON with invalid or empty wallet addresses.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout>
      <div className="container">
        <div className="innerHeader all-purple">
          <h1 className="all-purple">Wallets and Funds</h1>
          <p className="description">
            This setup wizard allows you to enter and manage the wallets your entity works with. Save the generated JSON file to your website to ensure transparency for potential donors.
          </p>
        </div>
        <div className="divider"></div>
        <div className="wallets-and-such">
          <div className="wallet-management">
            <div className="new-wallets">
              <h3 className="all-dark-purple">Add a Wallet</h3>
              <div className="wallet-input">
                <input
                  type="text"
                  className="form-input"
                  placeholder="0x..."
                  value={newWallet}
                  ref={newWalletInputRef}
                  onChange={(e) => setNewWallet(e.target.value)}
                />
                <div className="add-new-wallet" onClick={handleAddWallet}>
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15" cy="15" r="13.5" stroke="#883FFF" strokeWidth="3"/>
                    <path d="M15 9L15 21" stroke="#883FFF" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M9 15L21 15" stroke="#883FFF" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

            </div>
            <div className="connected-wallets">
              <h3 className="all-dark-purple">Connected Wallets</h3>
              {wallets.map((wallet, index) => (
                <div key={index} className="wallet-input">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="0x..."
                    value={wallet}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                  <div onClick={() => handleRemoveWallet(index)}>
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="15" cy="15" r="13.5" stroke="#FF3F3F" strokeWidth="3"/>
                      <path d="M9 15L21 15" stroke="#FF3F3F" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="json-container">
            <div className="columns apart">
              <div className="column">
                <h3 className="all-purple">JSON Preview</h3>
              </div>
              <div className="column">
                <button className="btn grey btn-small" onClick={downloadJsonFile}>Download JSON</button>
              </div>
            </div>
            <pre className="json-preview">
              {JSON.stringify(wallets.filter(wallet => wallet).map(wallet => ({ wallet })), null, 2)}
            </pre>
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WalletsAndFunds;
