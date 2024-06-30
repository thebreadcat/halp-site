'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link'
import Head from 'next/head';
import { fetchOrCreateEntity } from '../components/supabaseUtils';
import DashboardSidebar from '../components/DashboardSidebar';

const HomePage: React.FC = () => {
  const account = useAccount();
  const { address, isConnected } = useAccount();
  const [entityId, setEntityId] = useState<number | null>(null);
  const { disconnect } = useDisconnect();
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

  return (
    <div>
      <Head>
        <title>HALP | onChain Transparent Fundraising for All</title>
        <meta
          content="Halp Website"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      {(isConnected) && (
        <DashboardSidebar />
      )}
      <header className={`header ${!isConnected ? 'not-connected' : 'connected'}`}>
        <div className={`wallet-holder`}>
          <ConnectButton
            label="Connect"
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'avatar',
            }}
          />
        </div>
      </header>
      <div className={`container text-center ${!isConnected ? 'not-connected' : 'connected'}`}>
        <div className="logo-container">
          <div className="purple-corner">
            <svg width="592" height="236" viewBox="0 0 592 236" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M33 235L-49 195V-65L575 -43L591 33L33 235Z" fill="#883FFF" stroke="black"/>
            </svg>
          </div>

          <svg width="758" height="447" viewBox="0 0 758 447" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_6_44)">
            <path d="M-8.99455 151.428C-17.6254 153.77 -25.2455 158.885 -30.6793 165.984C-36.113 173.084 -39.0584 181.773 -39.0611 190.711V347.906C-39.0219 356.416 -36.6552 364.754 -32.2171 372.017C-27.7789 379.28 -21.4382 385.192 -13.881 389.113L87.1451 441.719C97.5564 447.134 109.625 448.436 120.953 445.367L691.163 290.614C694.445 289.728 697.342 287.785 699.407 285.087C701.472 282.389 702.589 279.085 702.585 275.688V220.533L726.59 214.016C735.099 211.679 742.622 206.649 748.031 199.68C753.441 192.71 756.445 184.177 756.595 175.358L758 71.8692C758.065 67.0849 756.799 62.3766 754.342 58.2696C751.886 54.1627 748.336 50.8186 744.089 48.6105L632.069 -9.71948C621.663 -15.1349 609.599 -16.4371 598.276 -13.367L-8.99455 151.428Z" fill="#883FFF"/>
            <path d="M316.271 207.972L290.434 382.306L361.012 363.168V305.509C361.144 302.737 362.153 300.078 363.892 297.915C365.632 295.751 368.013 294.194 370.693 293.468C376.037 292.171 380.374 295.452 380.374 300.794V357.918L445.302 340.275L421.908 192.039C421.379 188.688 420.15 185.486 418.3 182.642C416.449 179.797 414.02 177.375 411.171 175.531C408.321 173.688 405.114 172.466 401.76 171.944C398.406 171.423 394.98 171.614 391.704 172.504L333.831 188.209C329.298 189.438 325.222 191.963 322.102 195.473C318.983 198.984 316.957 203.328 316.271 207.972ZM380.298 245.073C380.168 247.846 379.16 250.507 377.42 252.671C375.68 254.835 373.298 256.391 370.617 257.115C365.272 258.412 360.935 255.131 360.935 249.789V232.299C361.07 229.528 362.08 226.87 363.819 224.707C365.558 222.544 367.937 220.986 370.617 220.258C375.961 218.961 380.298 222.242 380.298 227.584V245.073ZM534.524 235.245V133.755L463.214 153.107V303.831C463.211 307.547 464.067 311.214 465.714 314.546C467.362 317.878 469.756 320.786 472.711 323.042C475.666 325.298 479.102 326.843 482.752 327.556C486.401 328.268 490.166 328.129 493.753 327.15L596.169 299.344V232.33L547.885 245.44C546.315 245.872 544.665 245.936 543.066 245.627C541.466 245.317 539.96 244.643 538.664 243.657C537.368 242.67 536.317 241.398 535.594 239.939C534.871 238.479 534.494 236.873 534.494 235.245H534.524Z" fill="white"/>
            <path d="M695.79 159.486C695.655 162.258 694.646 164.916 692.907 167.079C691.168 169.242 688.788 170.799 686.109 171.528C680.749 172.825 676.413 169.544 676.413 164.202V146.697C676.547 143.925 677.558 141.266 679.301 139.105C681.043 136.944 683.427 135.391 686.109 134.671C691.454 133.358 695.79 136.639 695.79 141.996V159.486ZM614.859 130.398V294.262L686.078 274.925V219.709C686.075 216.312 687.192 213.008 689.257 210.31C691.322 207.612 694.219 205.669 697.5 204.783L704.815 202.783L722.238 198.068C727.305 196.692 731.786 193.705 735.004 189.559C738.222 185.412 740.001 180.331 740.073 175.084L741.401 77.5465L632.695 107.047C627.573 108.445 623.055 111.489 619.837 115.709C616.619 119.93 614.88 125.091 614.89 130.398H614.859Z" fill="white"/>
            <path d="M210.419 221.693V291.194C210.289 293.967 209.282 296.627 207.542 298.791C205.802 300.955 203.42 302.511 200.738 303.235C195.379 304.533 191.042 301.251 191.042 295.91V226.958L137.597 241.441C132.477 242.831 127.957 245.866 124.734 250.077C121.511 254.289 119.764 259.443 119.762 264.746V428.594L190.981 409.273V351.706C191.112 348.931 192.122 346.27 193.865 344.105C195.607 341.941 197.993 340.386 200.677 339.665C206.022 338.368 210.358 341.649 210.358 346.991V404.023L254.947 391.921C260.07 390.532 264.593 387.496 267.817 383.281C271.041 379.066 272.786 373.907 272.782 368.601V204.752L210.419 221.693Z" fill="white"/>
            </g>
            <defs>
            <clipPath id="clip0_6_44">
            <rect width="797" height="462" fill="white" transform="translate(-39 -15)"/>
            </clipPath>
            </defs>
          </svg>
        </div>
        <section>
          <div className="everything-left extra-bottom-padding pointer-container">
            <h1 className="homepage">Onchain Fundraising for All</h1>
            <a href="/get-started" className="btn">Get Started</a>
          </div>
          <div className="two-col-row all-dark-purple">
            <div className="first">
              <h2 className="all-dark-purple">{'Empowering compassionate action through onchain giving.'}</h2>
            </div>
            <div className="second">
              {"At HALP, we believe in the power of giving and the importance of trust. Whether you're looking to raise funds quickly or need to verify legitimate entities, HALP is your go-to solution for seamlessly integrating crypto into your fundraising efforts."}
            </div>
          </div>
        </section>
        <div className="divider"></div>
        <section>
          <div className="two-col-row all-dark-purple">
            <div className="bold-text-section">
              <h2 className="all-dark-purple">{'Benefiting those who flourish through a little halp'}</h2>
            </div>
            <div>
              <div className="three-col-row">
                <div className="icon-column">
                  <div className="icon">
                    <img src="/halp-group-icon.png" />
                  </div>
                  <div className="icon-column-text">
                    <b>{'Nonprofits'}</b>
                    {'Streamline fundraising efforts with a secure and verifiable platform designed to maximize impact.'}
                  </div>
                </div>
                <div className="icon-column">
                  <div className="icon">
                    <img src="/halp-club-icon.png" />
                  </div>
                  <div className="icon-column-text">
                    <b>{'School Groups & Clubs'}</b>
                    {'Easily organize and manage fundraisers for projects, events, and activities.'}
                  </div>
                </div>
                <div className="icon-column">
                  <div className="icon">
                    <img src="/halp-single-icon.png" />
                  </div>
                  <div className="icon-column-text">
                    <b>{'Individuals'}</b>
                    {'Easily raise funds for people in need.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="divider"></div>
        <section>
          <div className="two-col-row all-dark-purple">
            <div className="bold-text-section">
              <h2 className="all-dark-purple">{'Ensuring the funds are received where they are needed'}</h2>
            </div>
            <div>
              <div className="three-col-row">
                <div className="icon-column">
                  <div className="icon-column-text">
                    <b>{'Transparency'}</b>
                    {'Blockchain technology ensures every donation is traceable, enhancing trust and accountability.'}
                  </div>
                </div>
                <div className="icon-column">
                  <div className="icon-column-text">
                    <b>{'Efficiency'}</b>
                    {'Get crypto to worthy causes quickly, without the traditional delays and inefficiencies.'}
                  </div>
                </div>
                <div className="icon-column">
                  <div className="icon-column-text">
                    <b>{'Security'}</b>
                    {'HALP ensures that all transactions are secure and verifiable, protecting both donors and recipients.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
        <div className="button-spacer">
          <a href="/get-started" className="btn">Get Started</a>
        </div>
        <section className="quote-section">
          <blockquote>
            We envision a world where generosity is streamlined, transparent, and impactful, leveraging the power of blockchain technology.
            <cite>-Breadcat, Founder and CTO of HALP</cite>
          </blockquote>
          <div className="quote-image">
            <img src="/help-hand-magic.png" />
          </div>
        </section>
        <footer>
          <div className="footer-logo">
            <a href="/">
            <svg width="99" height="58" viewBox="0 0 99 58" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_28_160)">
              <path d="M3.72705 20.8936C2.65496 21.1876 1.70842 21.8297 1.03347 22.721C0.358512 23.6123 -0.00735505 24.7031 -0.00769043 25.8253V45.5597C-0.00282405 46.628 0.291156 47.6748 0.842446 48.5865C1.39374 49.4983 2.18135 50.2405 3.12008 50.7328L15.6691 57.3371C16.9624 58.0169 18.4615 58.1803 19.8686 57.795L90.6977 38.3671C91.1053 38.2559 91.4652 38.012 91.7217 37.6733C91.9782 37.3345 92.1169 36.9198 92.1165 36.4933V29.569L95.0982 28.7509C96.1553 28.4575 97.0897 27.826 97.7616 26.9511C98.4336 26.0762 98.8068 25.0049 98.8254 23.8978L98.9999 10.9057C99.0079 10.305 98.8506 9.71395 98.5455 9.19836C98.2404 8.68277 97.7995 8.26295 97.2719 7.98573L83.3572 0.662927C82.0647 -0.0169291 80.5661 -0.180407 79.1597 0.205012L3.72705 20.8936Z" fill="#883FFF"/>
              <path d="M44.1302 27.9923L40.9209 49.8783L49.6878 47.4757V40.2372C49.7042 39.8891 49.8295 39.5553 50.0456 39.2837C50.2616 39.0121 50.5574 38.8166 50.8903 38.7255C51.5542 38.5626 52.0929 38.9745 52.0929 39.6451V46.8166L60.1579 44.6017L57.2521 25.992C57.1864 25.5713 57.0336 25.1693 56.8038 24.8122C56.574 24.4551 56.2723 24.151 55.9183 23.9196C55.5643 23.6882 55.166 23.5347 54.7494 23.4693C54.3327 23.4038 53.9071 23.4277 53.5003 23.5396L46.3115 25.5111C45.7484 25.6654 45.2421 25.9824 44.8546 26.4231C44.4672 26.8638 44.2154 27.4092 44.1302 27.9923ZM52.0834 32.65C52.0672 32.9981 51.9421 33.332 51.7259 33.6037C51.5098 33.8754 51.2139 34.0707 50.8808 34.1617C50.217 34.3245 49.6783 33.9126 49.6783 33.242V31.0463C49.695 30.6983 49.8204 30.3647 50.0364 30.0931C50.2525 29.8215 50.548 29.626 50.8808 29.5346C51.5447 29.3717 52.0834 29.7837 52.0834 30.4543V32.65ZM71.2408 31.4161V18.6749L62.3828 21.1044V40.0264C62.3826 40.493 62.4889 40.9534 62.6935 41.3717C62.8981 41.79 63.1955 42.155 63.5626 42.4382C63.9296 42.7215 64.3564 42.9154 64.8098 43.0049C65.2631 43.0943 65.7308 43.0769 66.1764 42.954L78.898 39.4631V31.0501L72.9004 32.6959C72.7053 32.7502 72.5004 32.7583 72.3018 32.7194C72.1031 32.6806 71.9159 32.596 71.755 32.4721C71.594 32.3482 71.4635 32.1885 71.3736 32.0053C71.2838 31.8221 71.237 31.6205 71.237 31.4161H71.2408Z" fill="white"/>
              <path d="M91.2725 21.9052C91.2558 22.2532 91.1304 22.5868 90.9144 22.8584C90.6984 23.13 90.4028 23.3255 90.07 23.4169C89.4042 23.5798 88.8655 23.1678 88.8655 22.4972V20.2996C88.8822 19.9516 89.0078 19.6179 89.2243 19.3466C89.4407 19.0752 89.7369 18.8803 90.07 18.7899C90.7339 18.6251 91.2725 19.037 91.2725 19.7095V21.9052ZM81.2197 18.2534V38.8251L90.0662 36.3975V29.4656C90.0658 29.0391 90.2045 28.6244 90.461 28.2857C90.7175 27.9469 91.0774 27.703 91.485 27.5918L92.3935 27.3408L94.5578 26.7488C95.1872 26.5761 95.7438 26.2011 96.1435 25.6805C96.5432 25.16 96.7642 24.5221 96.7732 23.8633L96.9382 11.6184L83.4351 15.322C82.7989 15.4974 82.2376 15.8796 81.8379 16.4094C81.4382 16.9392 81.2223 17.5872 81.2235 18.2534H81.2197Z" fill="white"/>
              <path d="M30.9818 29.7146V38.4399C30.9657 38.788 30.8405 39.122 30.6244 39.3937C30.4083 39.6653 30.1124 39.8607 29.7793 39.9516C29.1135 40.1144 28.5748 39.7025 28.5748 39.0319V30.3756L21.9361 32.1939C21.3002 32.3684 20.7387 32.7494 20.3384 33.2781C19.938 33.8068 19.721 34.4539 19.7207 35.1195V55.6893L28.5672 53.2637V46.0367C28.5835 45.6883 28.709 45.3542 28.9254 45.0825C29.1419 44.8108 29.4383 44.6156 29.7717 44.525C30.4356 44.3621 30.9742 44.7741 30.9742 45.4447V52.6046L36.5128 51.0852C37.1492 50.9109 37.7111 50.5297 38.1115 50.0006C38.512 49.4714 38.7287 48.8237 38.7282 48.1577V27.5879L30.9818 29.7146Z" fill="white"/>
              </g>
              <defs>
              <clipPath id="clip0_28_160">
              <rect width="99" height="58" fill="white"/>
              </clipPath>
              </defs>
            </svg>
            </a>
          </div>
          <div className="footer-links">
            <div className="footer-link-row grey">Copyright © 2024 HALP LLC.</div>
            <div className="footer-link-row">
              <a href="" target="_blank">Privacy Policy</a>
              <a href="" target="_blank">Terms of Service</a>
              <a href="" target="_blank">Contact Halp</a>
            </div>
          </div>
          <div className="social-links">
            <a href="https://warpcast.com/halp" target="_blank">
              <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="58" height="58" rx="5" fill="#855DCD"/>
                <path d="M15.7702 9.90247H43.1421V48.0976H39.1242V30.6018H39.0848C38.6408 25.7663 34.4994 21.9771 29.4562 21.9771C24.4129 21.9771 20.2716 25.7663 19.8275 30.6018H19.7881V48.0976H15.7702V9.90247Z" fill="white"/>
                <path d="M8.48779 15.3237L10.1201 20.745H11.5012V42.6763C10.8078 42.6763 10.2456 43.228 10.2456 43.9084V45.387H9.9945C9.30106 45.387 8.73891 45.9386 8.73891 46.6191V48.0976H22.8015V46.6191C22.8015 45.9386 22.2394 45.387 21.546 45.387H21.2948V43.9084C21.2948 43.228 20.7327 42.6763 20.0392 42.6763H18.5325V15.3237H8.48779Z" fill="white"/>
                <path d="M39.3754 42.6763C38.6819 42.6763 38.1198 43.228 38.1198 43.9084V45.387H37.8687C37.1752 45.387 36.6131 45.9386 36.6131 46.6191V48.0976H50.6757V46.6191C50.6757 45.9386 50.1136 45.387 49.4201 45.387H49.169V43.9084C49.169 43.228 48.6068 42.6763 47.9134 42.6763V20.745H49.2945L50.9268 15.3237H40.8821V42.6763H39.3754Z" fill="white"/>
              </svg>
            </a>

          </div>
        </footer>
      </div>
  );
};

export default HomePage;
