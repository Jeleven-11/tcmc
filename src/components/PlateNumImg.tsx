'use client';

import React from 'react';
import { Drawer } from 'antd';
import GdriveFetchImages from '@/components/admin/gdrive/GdriveFetchImages';

interface ImageGalleryDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ImageGalleryDrawer: React.FC<ImageGalleryDrawerProps> = ({ open, onClose }) => {
  return (
    <Drawer
      title="Captured License Plates"
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
    >
      <GdriveFetchImages />
    </Drawer>
  );
};

export default ImageGalleryDrawer;
