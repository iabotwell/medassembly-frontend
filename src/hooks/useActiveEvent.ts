import { useEffect } from 'react';
import { useEventStore } from '../stores/eventStore';
import api from '../services/api';

export function useActiveEvent() {
  const { activeEvent, setActiveEvent } = useEventStore();

  useEffect(() => {
    if (!activeEvent) {
      api.get('/events/active')
        .then(({ data }) => setActiveEvent(data))
        .catch(() => {});
    }
  }, [activeEvent, setActiveEvent]);

  return activeEvent;
}
