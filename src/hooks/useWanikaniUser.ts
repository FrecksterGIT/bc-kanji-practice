import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore.ts';
import { WanikaniUserData, UseWanikaniUserResult } from '../types';
import { WaniKaniApiClient } from '../utils/wanikaniApi.ts';

function useWanikaniUser(): UseWanikaniUserResult {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const [user, setUser] = useState<WanikaniUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserData = useCallback(() => {
    const client = new WaniKaniApiClient(apiKey);
    client
      .getUser()
      .then((data) => {
        setUser(data.data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [apiKey]);
  useEffect(() => {
    if (apiKey) {
      setLoading(true);
      fetchUserData();
    }
  }, [apiKey, fetchUserData]);

  return { user, loading, refetch: fetchUserData };
}

export default useWanikaniUser;
