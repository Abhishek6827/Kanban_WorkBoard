import { useEffect } from 'react';
import { getCSRFToken } from '../api';

export function CSRFToken() {
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const token = await getCSRFToken();
        localStorage.setItem('csrfToken', token);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchCSRFToken();
  }, []);

  return null;
}