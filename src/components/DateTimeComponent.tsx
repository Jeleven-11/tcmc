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
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      console.log(`Scroll: ${scrollTop}`);
      if(timeContainer) {
        const elementTop = timeContainer.offsetTop;
        console.log(`Element top: ${elementTop}`);
        if (scrollTop >= elementTop) {
          setIsStuck(true);
        } else {
          setIsStuck(false);
        }
      }

      
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    // <div>
    //   <p>Server Time: {stringTime}</p>
    // </div>
    <div ref={timeContainerRef} className={`${styles.timeContainer} ${isStuck ? 'sticky' : ''}`}>
    <p className={styles.time}>Philippine Standard Time: {stringTime}</p>
    </div>
  );
};

export default DateTimeComponent;