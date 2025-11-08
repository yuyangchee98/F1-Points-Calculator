import { useState, useEffect } from 'react';

const EMAIL_STORAGE_KEY = 'f1_user_email';

export const useUserEmail = () => {
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const savedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const saveEmail = (newEmail: string) => {
    setEmail(newEmail);
    localStorage.setItem(EMAIL_STORAGE_KEY, newEmail);
  };

  return { email, saveEmail };
};