"use client";
import React, { useState, useEffect, useRef } from 'react';
import { DateTime } from 'luxon';
import styles from './DateTimeComponent.module.css';

const DateTimeComponent: React.FC = () => {
  const [stringTime, setStringTime] = useState<string>('');
  const [isStuck, setIsStuck] = useState(false);
  const timeContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setStringTime(DateTime.now().setZone('Asia/Manila').toFormat('DDDD tt'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const timeContainer = timeContainerRef.current;
    const initial =  80;
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // console.log(`Scroll: ${scrollTop}`);
      if(timeContainer) {
        // const elementTop = timeContainer.offsetTop - 8;
        // console.log(`Element top: ${elementTop}`);
        if (!isStuck && scrollTop >= initial) {
          setIsStuck(true);
        } else if (isStuck && scrollTop <= initial) {
          setIsStuck(false);
        }
      }

      
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isStuck, timeContainerRef]);

  return (
    <div>
    {isStuck ? <div style={{ height: 32 }} /> : null}
    <div ref={timeContainerRef} className={`${styles.timeContainer} ${isStuck ? styles.sticky : ''}`}>
      <p className={styles.time}>Philippine Standard Time: {stringTime}</p>
    </div>
  </div>
  );
};

export default DateTimeComponent;