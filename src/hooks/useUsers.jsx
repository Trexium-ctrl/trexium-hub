import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

let cachedUsers = null;

export function useUsers() {
  const [users, setUsers] = useState(cachedUsers || []);
  const [loading, setLoading] = useState(!cachedUsers);

  useEffect(() => {
    if (cachedUsers) return;
    let mounted = true;
    base44.entities.User.list()
      .then(data => {
        cachedUsers = data;
        if (mounted) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { users, loading };
}