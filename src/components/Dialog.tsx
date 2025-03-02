import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface DialogProps {
    title: string,
    description: string,
    open: boolean,
    isPrimaryButton?: boolean,
    primaryButtonLabel?:string,
    isSecondaryButton?: boolean,
    secondaryButtonLabel?:string,
    onClose?: () => void;
    onPrimaryAction?: () => void;
    onSecondaryAction?: () => void;
}
const AlertDialog: React.FC<DialogProps> = ({
    title, description, open,
    isPrimaryButton, primaryButtonLabel, 
    isSecondaryButton, secondaryButtonLabel,
    onClose, onPrimaryAction, onSecondaryAction
}) => {
//   const [open, setOpen] = React.useState(false);

//   const handleClickOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {isSecondaryButton && (<Button onClick={onSecondaryAction}>{secondaryButtonLabel}</Button>)}
          {isPrimaryButton && (<Button onClick={onPrimaryAction} autoFocus>
            {primaryButtonLabel}
          </Button>)}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default AlertDialog
