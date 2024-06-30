import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import Link from 'next/link'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, address } = useAccount();
  return (
    <div>
      {isConnected && (
        <>
          <button onClick={() => setIsOpen(!isOpen)} className="fixed top-0 left-0 z-20 m-4 menuButton">
            {(!isOpen) && (
              <svg
                viewBox="0 0 700 1000"
                fill="#f6f6f6"
                height="1rem"
                width="1rem"
              >
                <path d="M650 450c14.667 0 26.667 5 36 15 9.333 10 14 21.667 14 35 0 13.333-5 25-15 35s-21.667 15-35 15H50c-13.333 0-25-5-35-15S0 513.333 0 500c0-13.333 4.667-25 14-35s21.333-15 36-15h600M50 350c-13.333 0-25-5-35-15S0 313.333 0 300c0-13.333 4.667-25 14-35s21.333-15 36-15h600c14.667 0 26.667 5 36 15 9.333 10 14 21.667 14 35 0 13.333-5 25-15 35s-21.667 15-35 15H50m600 300c14.667 0 26.667 5 36 15 9.333 10 14 21.667 14 35 0 13.333-5 25-15 35s-21.667 15-35 15H50c-13.333 0-25-5-35-15S0 713.333 0 700c0-13.333 4.667-25 14-35s21.333-15 36-15h600" />
              </svg>
            )}
            {(isOpen) && (
              <svg fill="none" viewBox="0 0 24 24" height="1rem" width="1rem">
                <path
                  fill="#f6f6f6"
                  d="M6.225 4.811a1 1 0 00-1.414 1.414L10.586 12 4.81 17.775a1 1 0 101.414 1.414L12 13.414l5.775 5.775a1 1 0 001.414-1.414L13.414 12l5.775-5.775a1 1 0 00-1.414-1.414L12 10.586 6.225 4.81z"
                />
              </svg>
            )}
          </button>
          {isOpen && (
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <div className="fixed top-10 w-[250px]p-4 z-10 todolist">
                <h6>Navigation</h6>
                <Link href="/dashboard" className="todo">Dashboard</Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
