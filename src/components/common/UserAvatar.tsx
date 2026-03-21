import React from 'react';

interface UserAvatarProps {
  name: string;
  photoUrl?: string;
  size?: 'sm' | 'md';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, photoUrl, size = 'md' }) => {
  return photoUrl ? (
    <img
      src={photoUrl}
      alt={name}
      title={name}
      className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-primary/20`}
    />
  ) : (
    <div
      className={`${sizeClasses[size]} rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
