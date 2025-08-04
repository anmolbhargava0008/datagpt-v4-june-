
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FreeTierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FreeTierModal = ({ isOpen, onClose }: FreeTierModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subscription Expired</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Your subscription has expired. Please renew to access this feature.
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>OK</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FreeTierModal;
