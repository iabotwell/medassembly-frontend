import { create } from 'zustand';
import { Event } from '../types';

interface EventState {
  activeEvent: Event | null;
  setActiveEvent: (event: Event | null) => void;
}

export const useEventStore = create<EventState>((set) => ({
  activeEvent: null,
  setActiveEvent: (event) => set({ activeEvent: event }),
}));
