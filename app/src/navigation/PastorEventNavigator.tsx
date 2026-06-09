import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PastorEventDashboard from '../screens/admin/pastor_events/PastorEventDashboard';
import PastorEventDetail from '../screens/admin/pastor_events/PastorEventDetail';
import PastorEventRoutePlanner from '../screens/admin/pastor_events/PastorEventRoutePlanner';
import PastorEventMap from '../screens/admin/pastor_events/PastorEventMap';
import CreatePastorEvent from '../screens/admin/pastor_events/CreatePastorEvent';
import { PastorEvent } from '../types/event';

export type PastorEventStackParamList = {
  Dashboard: undefined;
  EventDetail: { event: PastorEvent; allEvents: PastorEvent[] };
  RoutePlanner: { events: PastorEvent[] };
  EventMap: { events: PastorEvent[] };
  CreateEvent: undefined;
};

const Stack = createNativeStackNavigator<PastorEventStackParamList>();

export default function PastorEventNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={PastorEventDashboard} 
      />
      <Stack.Screen 
        name="EventDetail" 
        component={PastorEventDetail} 
      />
      <Stack.Screen 
        name="RoutePlanner" 
        component={PastorEventRoutePlanner} 
      />
      <Stack.Screen 
        name="EventMap" 
        component={PastorEventMap} 
      />
      <Stack.Screen 
        name="CreateEvent" 
        component={CreatePastorEvent} 
      />
    </Stack.Navigator>
  );
}
