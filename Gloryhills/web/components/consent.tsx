'use client';

import {useState} from 'react';
import {updateConsentState} from './analytics';

export default function Consent() {
  const [message, setMessage] = useState('');

  function save(value: string) {
    const isGranted = value === 'granted';
    updateConsentState(isGranted);
    setMessage(isGranted ? 'Optional analytics and advertising allowed.' : 'Optional analytics and advertising disabled.');
    if (!isGranted) {
      setTimeout(() => window.location.reload(), 300);
    }
  }

  return (
    <>
      <div className="actions" style={{justifyContent: 'flex-start'}}>
        <button className="button" onClick={() => save('granted')}>
          Allow analytics and advertising
        </button>
        <button className="button light" onClick={() => save('denied')}>
          Reject optional services
        </button>
      </div>
      <p role="status">{message}</p>
    </>
  );
}
