import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput
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
  const [currentLocName, setCurrentLocName] = useState('Guntur, AP');
  const [currentLoc, setCurrentLoc] = useState<{lat: number, lng: number} | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Sort events by time to plan the route sequentially
  const sortedEvents = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Initialize with IP-based or fallback location
  useEffect(() => {
    const fetchInitialLoc = async () => {
      try {
        setIsGeocoding(true);
        const ipResp = await fetch('http://ip-api.com/json/');
        const ipData = await ipResp.json();
        if (ipData && ipData.lat && ipData.lon) {
          setCurrentLoc({ lat: ipData.lat, lng: ipData.lon });
          setCurrentLocName(ipData.city || 'Guntur, AP');
        }
      } catch (e) {
        console.log('IP Location failed');
      } finally {
        setIsGeocoding(false);
      }
    };
    fetchInitialLoc();
  }, []);

  // Handle manual starting address change
  const handleAddressSubmit = async (newAddress: string) => {
    if (!newAddress.trim()) return;
    const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';
    if (!GOOGLE_KEY) return;
    
    setIsGeocoding(true);
    try {
      const geoResp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(newAddress)}&key=${GOOGLE_KEY}`);
      const geoData = await geoResp.json();
      if (geoData.status === 'OK' && geoData.results.length > 0) {
        const { lat, lng } = geoData.results[0].geometry.location;
        setCurrentLoc({ lat, lng });
      }
    } catch (e) {
      console.log('Geocoding failed');
    } finally {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';
    
    // Generate stops list
    const generatedStops: RouteStop[] = [
      { label: currentLocName, sublabel: 'Starting Point', isHome: true }
    ];
    
    sortedEvents.forEach(evt => {
      generatedStops.push({
        label: evt.title,
        sublabel: `${evt.startTime} · ${evt.venue}`
      });
    });
    setStops(generatedStops);

    const calculateDistances = async () => {
      const generatedLegs: RouteLeg[] = [];
      
      // Calculate distances between each consecutive stop
      for (let i = 0; i < sortedEvents.length; i++) {
        const destination = sortedEvents[i];
        let originLat, originLng;
        
        if (i === 0) {
          // Travel from Current Location to 1st Event
          if (currentLoc) {
            originLat = currentLoc.lat;
            originLng = currentLoc.lng;
          } else {
            originLat = destination.lat + 0.01;
            originLng = destination.lng - 0.01;
          }
        } else {
          // Travel from Event(i-1) to Event(i)
          originLat = sortedEvents[i - 1].lat;
          originLng = sortedEvents[i - 1].lng;
        }

        let distKm = 0;
        let carMins = 0;

        if (GOOGLE_KEY && originLat !== 0 && destination.lat !== 0) {
          try {
            const destStr = `${destination.lat},${destination.lng}`;
            const originStr = `${originLat},${originLng}`;
            const distResp = await fetch(
              `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destStr}&key=${GOOGLE_KEY}`
            );
            const distData = await distResp.json();
            
            if (distData.status === 'OK' && distData.rows[0].elements[0].status === 'OK') {
              const element = distData.rows[0].elements[0];
              distKm = element.distance.value / 1000; // meters to km
              carMins = Math.round(element.duration.value / 60); // seconds to mins
            }
          } catch (err) {
            console.warn('Distance API failed', err);
          }
        }

        // Apply defaults or estimates for other modes if car is 0
        if (distKm === 0) distKm = 5.0; // fallback
        if (carMins === 0) carMins = Math.round(distKm * 2); // rough estimate: 2 mins per km

        let duration = carMins;
        if (mode === 'bike') duration = Math.round(carMins * 2.5);
        else if (mode === 'walk') duration = Math.round(carMins * 8);

        generatedLegs.push({
          distKm: distKm,
          minutes: duration,
          mode: mode
        });
      }

      setLegs(generatedLegs);
      setConflicts(detectConflicts(sortedEvents, generatedLegs));
    };

    calculateDistances();

  }, [mode, events, currentLoc, currentLocName]);

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

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <Text style={styles.sectionTitle}>Route Plan</Text>
          <TransportToggle value={mode} onChange={setMode} />
        </View>

        <View style={{ backgroundColor: '#fff', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md, elevation: 2 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>
            STARTING FROM
          </Text>
          <TextInput
            style={{ backgroundColor: colors.bgSecondary, padding: 12, borderRadius: radius.sm, fontSize: 16, color: colors.textPrimary }}
            value={currentLocName}
            onChangeText={setCurrentLocName}
            onEndEditing={(e) => handleAddressSubmit(e.nativeEvent.text)}
            placeholder="Type starting address..."
          />
          <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 4 }}>
            {isGeocoding ? 'Updating coordinates...' : 'Press Enter on keyboard to lock in your custom start location.'}
          </Text>
        </View>

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
