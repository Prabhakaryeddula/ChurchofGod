import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadow } from '../../../theme/Theme';
import { PastorEvent, TransportMode } from '../../../types/event';
import { openRoute } from '../../../utils/maps';
import { detectConflicts } from '../../../utils/conflicts';
import TransportToggle from '../../../components/TransportToggle';
import RouteChain, { RouteStop, RouteLeg } from '../../../components/RouteChain';

export const PastorEventRoutePlanner = ({ route, navigation }: { route: any; navigation: any }) => {
  const { events = [] } = route.params as { events: PastorEvent[] };
  const [mode, setMode] = useState<TransportMode>('car');
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [legs, setLegs] = useState<RouteLeg[]>([]);
  const [conflicts, setConflicts] = useState<{ message: string }[]>([]);

  // Sort events by time to plan the route sequentially
  const sortedEvents = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));

  useEffect(() => {
    // Generate stops list
    // 1st stop is home / starting point
    const generatedStops: RouteStop[] = [
      { label: 'Home / Church Office', sublabel: 'Starting Location', isHome: true }
    ];
    
    sortedEvents.forEach(evt => {
      generatedStops.push({
        label: evt.title,
        sublabel: `${evt.startTime} · ${evt.venue}`
      });
    });
    setStops(generatedStops);

    // Generate legs list based on the travel details in PastorEvents
    // legs[0] is the travel to the 1st event.
    // Since the first stop is Home, legs[i] represents travel from stop i to stop i+1
    const generatedLegs: RouteLeg[] = [];
    sortedEvents.forEach((evt, idx) => {
      let duration = 0;
      if (mode === 'car') duration = evt.travel?.car || 0;
      else if (mode === 'bike') duration = evt.travel?.bike || 0;
      else if (mode === 'walk') duration = evt.travel?.walk || 0;

      generatedLegs.push({
        distKm: evt.travel?.distKm || 0,
        minutes: duration,
        mode: mode
      });
    });
    setLegs(generatedLegs);

    // Run conflicts detection
    const generatedConflicts = detectConflicts(sortedEvents, generatedLegs);
    setConflicts(generatedConflicts);

  }, [mode, events]);

  const handleLaunchGoogleMaps = () => {
    // Collect coordinates for the route
    // Starts at home / church location (we can use the first event's location or church)
    // and then visits all events.
    if (sortedEvents.length === 0) return;

    // Use Guntur central coordinates for home / first waypoint if empty,
    // otherwise use first event's coordinates minus a tiny offset for home, or first event directly
    const coordinates = sortedEvents.map(e => ({ lat: e.lat, lng: e.lng }));
    // Add home coordinate at the start if available. For demo, we start at first event or NTR stadium
    if (coordinates.length > 0) {
      // Prepend a starting office location near the first event
      const first = coordinates[0];
      coordinates.unshift({ lat: first.lat + 0.01, lng: first.lng - 0.01 });
    }

    openRoute(coordinates);
  };

  const totalDistance = legs.reduce((acc, curr) => acc + curr.distKm, 0);
  const totalDuration = legs.reduce((acc, curr) => acc + curr.minutes, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgPrimary} />
      
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Route Planner</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Route Summaries card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Itinerary Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{sortedEvents.length} Stops</Text>
              <Text style={styles.statLbl}>Appointments</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{totalDistance.toFixed(1)} km</Text>
              <Text style={styles.statLbl}>Total Distance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{totalDuration} mins</Text>
              <Text style={styles.statLbl}>Travel Time</Text>
            </View>
          </View>
        </View>

        {/* Transport Mode Toggle */}
        <Text style={styles.sectionTitle}>Select Travel Mode</Text>
        <TransportToggle value={mode} onChange={setMode} />

        {/* Conflict Warning Banner */}
        {conflicts.length > 0 ? (
          <View style={styles.warningCard}>
            <Ionicons name="warning-outline" size={24} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Schedule Conflicts Detected</Text>
              {conflicts.map((c, i) => (
                <Text key={i} style={styles.warningText}>• {c.message}</Text>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle-outline" size={22} color={colors.success} />
            <Text style={styles.successText}>All travel timings align. No conflicts.</Text>
          </View>
        )}

        {/* Route Chain Visualizer */}
        <Text style={styles.sectionTitle}>Route Chain</Text>
        <View style={styles.chainCard}>
          <RouteChain stops={stops} legs={legs} />
        </View>

        {/* Launch Google Maps button */}
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={handleLaunchGoogleMaps}
        >
          <Ionicons name="logo-google" size={18} color="#FFF" />
          <Text style={styles.actionButtonText}>Open Route in Google Maps</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    height: 56,
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backButton: {
    padding: spacing.xs
  },
  navTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center'
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md
  },
  summaryCard: {
    backgroundColor: colors.bgPrimary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.xs
  },
  statBox: {
    alignItems: 'center',
    flex: 1
  },
  statVal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  statLbl: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    marginBottom: spacing.xs
  },
  warningCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.warningLight,
    borderColor: '#F3D299',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: spacing.xs
  },
  warningText: {
    fontSize: 12,
    color: colors.warning,
    lineHeight: 16,
    marginTop: 2
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successLight,
    borderColor: '#AEE4D4',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md
  },
  successText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success
  },
  chainCard: {
    backgroundColor: colors.bgPrimary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    gap: 8,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    ...shadow.card
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default PastorEventRoutePlanner;
