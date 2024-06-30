// components/DashboardSidebar.tsx
import React, { useState } from 'react';
import { MouseEvent } from 'react';
import Link from 'next/link';
import { useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/router';

const DashboardSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { disconnect } = useDisconnect();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleDisconnect = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    disconnect();
  };

  return (
    <>
      <div className={`hamburger-menu ${isOpen ? 'hidden' : ''}`} onClick={toggleMenu} >
        <svg width="45" height="39" viewBox="0 0 45 39" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 10C0 4.47715 4.47715 0 10 0H45V11H0V10Z" fill="white"/>
          <path d="M0 14H45V25H0V14Z" fill="white"/>
          <path d="M0 28H45V33C45 36.3137 42.3137 39 39 39H0V28Z" fill="white"/>
        </svg>
      </div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <Link href="/" className="sidebar-logo">
          <svg width="183" height="115" viewBox="0 0 183 115" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_17_822)">
            <path d="M-5.62031 41.4269C-7.74284 42.0098 -9.61679 43.283 -10.9531 45.0502C-12.2893 46.8174 -13.0137 48.9803 -13.0143 51.2052V90.3338C-13.0047 92.4521 -12.4227 94.5275 -11.3312 96.3353C-10.2398 98.1432 -8.68049 99.6147 -6.82199 100.591L18.0226 113.686C20.5829 115.033 23.5509 115.358 26.3366 114.593L166.564 76.0727C167.371 75.8521 168.083 75.3686 168.591 74.6969C169.099 74.0253 169.374 73.203 169.373 72.3574V58.6282L175.276 57.0061C177.369 56.4243 179.219 55.1722 180.549 53.4375C181.879 51.7028 182.618 49.5787 182.655 47.3835L183.001 21.6232C183.017 20.4323 182.705 19.2604 182.101 18.2381C181.497 17.2158 180.624 16.3834 179.58 15.8337L152.031 1.31437C149.472 -0.0336169 146.506 -0.357753 143.721 0.40644L-5.62031 41.4269Z" fill="#883FFF"/>
            <path d="M74.369 55.5018L68.0151 98.8965L85.3718 94.1327V79.7805C85.4044 79.0904 85.6524 78.4285 86.0801 77.89C86.5079 77.3514 87.0934 76.9639 87.7526 76.7832C89.0669 76.4602 90.1334 77.277 90.1334 78.6066V92.8259L106.101 88.4344L100.348 51.5357C100.218 50.7016 99.9151 49.9045 99.4601 49.1965C99.0051 48.4885 98.4077 47.8854 97.7069 47.4267C97.0061 46.9679 96.2176 46.6636 95.3927 46.5338C94.5679 46.404 93.7252 46.4515 92.9198 46.6732L78.6875 50.5822C77.5726 50.8883 76.5702 51.5167 75.8031 52.3906C75.036 53.2644 74.5376 54.3456 74.369 55.5018ZM90.1146 64.7369C90.0826 65.4271 89.8348 66.0893 89.4069 66.628C88.9791 67.1666 88.3932 67.554 87.7338 67.7342C86.4195 68.0571 85.353 67.2403 85.353 65.9107V61.5572C85.3862 60.8673 85.6344 60.2057 86.062 59.6673C86.4897 59.1288 87.0749 58.7412 87.7338 58.5599C89.0481 58.237 90.1146 59.0537 90.1146 60.3834V64.7369ZM128.042 62.2904V37.0278L110.505 41.8448V79.3626C110.505 80.2877 110.715 81.2005 111.12 82.0299C111.526 82.8594 112.114 83.583 112.841 84.1447C113.568 84.7063 114.413 85.0908 115.31 85.2682C116.208 85.4455 117.134 85.411 118.016 85.1673L143.202 78.2457V61.5648L131.328 64.828C130.942 64.9357 130.536 64.9516 130.143 64.8746C129.75 64.7976 129.379 64.6298 129.06 64.3842C128.742 64.1386 128.483 63.8219 128.305 63.4587C128.127 63.0955 128.035 62.6957 128.035 62.2904H128.042Z" fill="white"/>
            <path d="M167.701 43.4327C167.668 44.1227 167.42 44.7842 166.992 45.3227C166.565 45.8611 165.979 46.2488 165.32 46.4301C164.002 46.753 162.936 45.9362 162.936 44.6066V40.2493C162.969 39.5592 163.218 38.8975 163.646 38.3595C164.075 37.8216 164.661 37.4351 165.32 37.2557C166.635 36.929 167.701 37.7458 167.701 39.0792V43.4327ZM147.799 36.1921V76.9807L165.313 72.1675V58.4232C165.312 57.5776 165.587 56.7553 166.095 56.0836C166.602 55.412 167.315 54.9284 168.122 54.7078L169.921 54.2102L174.205 53.0363C175.451 52.694 176.553 51.9505 177.345 50.9183C178.136 49.8861 178.574 48.6213 178.591 47.3152L178.918 23.0365L152.185 30.3797C150.925 30.7277 149.814 31.4854 149.023 32.5359C148.231 33.5864 147.804 34.8713 147.806 36.1921H147.799Z" fill="white"/>
            <path d="M48.3378 58.917V76.2171C48.3058 76.9074 48.058 77.5695 47.6301 78.1082C47.2022 78.6468 46.6164 79.0342 45.957 79.2144C44.6389 79.5373 43.5724 78.7206 43.5724 77.391V60.2276L30.4291 63.8327C29.1701 64.1787 28.0585 64.9341 27.2659 65.9825C26.4733 67.0308 26.0436 68.3138 26.043 69.6336V110.419L43.5574 105.609V91.2797C43.5896 90.5889 43.838 89.9264 44.2666 89.3877C44.6951 88.849 45.2818 88.4619 45.9419 88.2824C47.2563 87.9595 48.3228 88.7762 48.3228 90.1058V104.302L59.288 101.29C60.548 100.944 61.6603 100.188 62.4531 99.1391C63.2459 98.0899 63.675 96.8057 63.6741 95.4851V54.7002L48.3378 58.917Z" fill="white"/>
            </g>
            <defs>
            <clipPath id="clip0_17_822">
            <rect width="196" height="115" fill="white" transform="translate(-13)"/>
            </clipPath>
            </defs>
          </svg>
        </Link>
        <div className="the-x" onClick={toggleMenu}>
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.9674 3.53553C6.92002 1.58291 10.0858 1.58291 12.0385 3.53553L42 33.4971L33.8118 41.6853L0.314752 8.18818L4.9674 3.53553Z" fill="#98F7C4"/>
            <path d="M0 33.4971L29.9616 3.53551C31.9142 1.58289 35.08 1.58289 37.0326 3.53551L41.6853 8.18816L8.18818 41.6852L0 33.4971Z" fill="#98F7C4"/>
          </svg>
        </div>
        <nav>
          <ul className="nav-links">
            <li className={`navItem ${router.pathname === '/dashboard/campaigns' ? 'selected' : ''}`}>
              <Link href="/dashboard/campaigns" onClick={toggleMenu}>
                Campaigns
              </Link>
            </li>
            <li className={`navItem ${router.pathname === '/dashboard/your-story' ? 'selected' : ''}`}>
              <Link href="/dashboard/your-story" onClick={toggleMenu}>
                Your Story
              </Link>
            </li>
            <li className={`navItem ${router.pathname === '/dashboard/funding-usage' ? 'selected' : ''}`}>
              <Link href="/dashboard/funding-usage" onClick={toggleMenu}>
                Funding Usage
              </Link>
            </li>
            <li className={`navItem ${router.pathname === '/dashboard/wallets-and-funds' ? 'selected' : ''}`}>
              <Link href="/dashboard/wallets-and-funds" onClick={toggleMenu}>
                Wallets and Funds
              </Link>
            </li>
            <li className={`navItem ${router.pathname === '/dashboard/identity-profile' ? 'selected' : ''}`}>
              <Link href="/dashboard/identity-profile" onClick={toggleMenu}>
                Identity/Profile
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      {isOpen && <div className="overlay" onClick={toggleMenu}></div>}
    </>
  );
};

export default DashboardSidebar;
