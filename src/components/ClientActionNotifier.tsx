import * as React from 'react';
import { useNotifications } from '@toolpad/core/useNotifications';
import Button from '@mui/material/Button';

interface NotifierProps {
  message: string;
  severity: 'error' | 'success';
}

const BasicNotification: React.FC<NotifierProps>  = ({ message, severity }) => {
  const notifications = useNotifications();
  return (
        <div>
      <Button
        onClick={() => {
          // preview-start
          notifications.show(message, {
            severity:severity,
            autoHideDuration: 3000,
          });
          // preview-end
        }}
      >
        Notify me
      </Button>
    </div>
    
  );
}
export default BasicNotification;

export const DedupeNotification: React.FC<NotifierProps> = ({ message, severity }) => {
  const notifications = useNotifications();
  return (
    // preview
    <div>
      <Button
        onClick={() => {
          // preview-start
          notifications.show(message, {
            key: 'dedupe-notification',
            severity:severity,
            autoHideDuration: 5000,
          });
          // preview-end
        }}
      >
        Notify me
      </Button>
    </div>
  );
}