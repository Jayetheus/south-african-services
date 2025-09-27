import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface SecurityAlertProps {
  type: 'warning' | 'error' | 'success' | 'info';
  title: string;
  description: string;
  className?: string;
}

const iconMap = {
  warning: AlertTriangle,
  error: AlertTriangle,
  success: CheckCircle,
  info: Info
};

const colorMap = {
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800'
};

export const SecurityAlert: React.FC<SecurityAlertProps> = ({
  type,
  title,
  description,
  className = ''
}) => {
  const Icon = iconMap[type];

  return (
    <Alert className={`${colorMap[type]} ${className}`}>
      <Icon className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <Shield size={16} />
        {title}
      </AlertTitle>
      <AlertDescription>
        {description}
      </AlertDescription>
    </Alert>
  );
};