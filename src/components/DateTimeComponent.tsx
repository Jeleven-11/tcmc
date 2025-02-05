"use client";
import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
// import { getServerTime } from '@/app/lib/actions';

const DateTimeComponent: React.FC = () => {
  const [stringTime, setStringTime] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      setStringTime(DateTime.now().setZone('Asia/Manila').toFormat('DDDD tt'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p>Server Time: {stringTime}</p>
    </div>
  );
};

export default DateTimeComponent;