import React, { useState } from 'react';

const OTPInput: React.FC<{ length?: number; onComplete?: (otp: string) => void }> = ({
  length = 6,
  onComplete,
}) => {
  const [otp, setOtp] = useState(Array(length).fill(''));

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Allow only numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Store only last digit
    setOtp(newOtp);

    // Move focus to the next input
    if (value && index < length - 1) {
      const nextInput = document.querySelector<HTMLInputElement>(`input[name="otp-${index + 1}"]`);
      nextInput?.focus();
    }

    // Call onComplete when all inputs are filled
    if (newOtp.every((digit) => digit !== '') && onComplete) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      // Move focus to the previous input on backspace
      const prevInput = document.querySelector<HTMLInputElement>(`input[name="otp-${index - 1}"]`);
      prevInput?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent:'space-evenly', gap: '8px' }}>
      {otp.map((digit, index) => (
        <input
          key={index}
          name={`otp-${index}`} // Using name instead of ref
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          style={{
            width: '40px',
            height: '40px',
            textAlign: 'center',
            fontSize: '18px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
      ))}
    </div>
  );
};

export default OTPInput;
