import React from 'react';

interface AdProps {
  slot?: string;
  format?: 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

export default function AdSensePlaceholder({ slot = 'xxxxxxxxx', format = 'horizontal', className = '' }: AdProps) {
  // AdSense is completely removed as requested
  return null;
}
