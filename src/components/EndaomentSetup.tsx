import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { supabase } from '../utils/supabaseClient';
import { Profile } from '../../types/types';

interface EndaomentData {
  name: string;
  nteeDescription: string;
}

interface EndaomentSetupProps {
  entityId: string;
  profile: Profile;
}

const EndaomentSetup: React.FC<EndaomentSetupProps> = ({ entityId, profile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<EndaomentData[]>([]);
  const [noResults, setNoResults] = useState(false);
  const [offset, setOffset] = useState(0);
  const [selectedEIN, setSelectedEIN] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(!profile.endaoment_data || !profile.ein);

  const abi = [{"inputs":[{"internalType":"bytes32","name":"_orgId","type":"bytes32"}],"name":"computeOrgAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}] as const;

  useEffect(() => {
    setShowSearch(!profile.endaoment_data || !profile.ein);
  }, [profile]);

  const fetchResults = async () => {
    setLoading(true);
    setNoResults(false);
    try {
      const response = await axios.get(
        `https://api.endaoment.org/v1/sdk/orgs/search`, {
          params: {
            searchTerm,
            deployedStatus: 'all',
            claimedStatus: 'all',
            count: 15,
            offset
          }
        }
      );
      if (response.data.length === 0) {
        setNoResults(true);
      } else {
        setResults(response.data);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setOffset(0);
    fetchResults();
  };

  const handlePagination = (newOffset: number) => {
    setOffset(newOffset);
    fetchResults();
  };

  const handleSelect = async (ein: string, result: EndaomentData) => {
    setSelectedEIN(ein);
    const bytes32EIN = ethers.utils.formatBytes32String(ein);
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
    const contract = new ethers.Contract('0x3d7bba3AEE1CFADC730F42Ca716172F94BBBa488', abi, provider);
    const walletAddress = await contract.computeOrgAddress(bytes32EIN);

    const { data, error } = await supabase
      .from('donation_entities')
      .update({ ein: ein, endaoment_wallet: walletAddress, endaoment_data: result })
      .eq('id', entityId);

    if (error) {
      console.error('Error storing data in Supabase:', error);
    } else {
      console.log('Data stored successfully:', data);
      profile.ein = ein;
      profile.endaoment_data = result;
      setShowSearch(false);
    }
  };

  return (
    <div>
      <h3 className="all-dark-purple">{(!profile.ein) ? 'Connect your Entity' : 'Entity Connected'}</h3>
      <p className="all-dark-purple contain">We use Endaoment to help reduce all of the overhead of accepting crypto for non-profits. Endaoment will automatically convert anything you receive to a dollar-backed currency and can do payouts in as little as 48 hours while making the tax and management side of things easier on you. This is optional and can be opted-in or out at any time.</p>
      <div className="button-container">
        <button className="btn btn-small small no-left" onClick={() => setShowSearch(true)}>Connect My Entity</button>
        <a href="https://endaoment.org/" target="_blank" rel="noopener noreferrer" className="btn grey btn-small small no-left">Learn More</a>
      </div>

      {!showSearch && (
        <div className="connected-entity-container">
          <div className="connected-entity">
            <h4 className="all-purple">Your Connected Entity</h4>
            <h3>{profile.endaoment_data?.name}</h3>
            <div>{profile.endaoment_data?.nteeDescription}</div>
            <div className="all-dark-purple">EIN: {profile.ein}</div>
          </div>
          {profile.is_non_profit && profile.ein && (
            <div className="button-container">
              <button className="btn btn-small secondary small no-left" onClick={() => setShowSearch(true)}>Change Entity</button>
              <a className="btn btn-small grey" href={`https://app.endaoment.org/orgs/${profile.ein}`} target="_blank">Endaoment Profile</a>
            </div>
          )}
        </div>
      )}

      {showSearch && (
        <>
          <div className="directory-search">
            <div className="floating-field">
              <input
                type="text"
                value={searchTerm}
                className="floating-input"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
              />
              <label className="form-label">Find your entity in the Endaoment directory</label>
            </div>
            <button className="btn btn-small secondary small no-left" onClick={handleSearch}>Search</button>
          </div>

          <div className="directory-results">
            {loading ? <p>Loading...</p> : (
              <div>
                {noResults && (
                  <div>
                    <h5>No Results for that search term. Please try again.</h5>
                  </div>
                )}
                {!noResults && (
                  <div>
                    {results.map((result) => (
                      <div key={result.name} className="card">
                        <div className="card-half">
                          <h4 className="all-purple">{result.name}</h4>
                          <div>{result.nteeDescription}</div>
                        </div>
                        <button className="btn btn-small small" onClick={() => handleSelect(result.name, result)}>Select</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {results.length > 0 && (
              <div className="pagination-buttons apart">
                <button className="btn btn-small grey small no-left" onClick={() => handlePagination(offset - 15)} disabled={offset === 0}>Previous</button>
                <button className="btn btn-small grey small no-left" onClick={() => handlePagination(offset + 15)}>Next</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EndaomentSetup;
