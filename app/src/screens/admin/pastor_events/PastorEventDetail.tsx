import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadow } from '../../../theme/Theme';
import SalesforceService from '../../../services/SalesforceService';
import { PastorEvent } from '../../../types/event';
import { openInMaps } from '../../../utils/maps';
import EventTypeBadge from '../../../components/EventTypeBadge';
import DistanceBadge from '../../../components/DistanceBadge';

export const PastorEventDetail = ({ route, navigation }: { route: any; navigation: any }) => {
  const { event, allEvents = [] } = route.params as { event: PastorEvent; allEvents: PastorEvent[] };
  const [deleting, setDeleting] = React.useState(false);

  // Format date nicely
  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString(undefined, options);
    } catch {
      return dateStr;
    }
  };

  // Helper to convert time strings like "9:00 AM" to sortable minutes
  const timeToMins = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(' ');
    if (parts.length < 2) return 0;
    const [time, modifier] = parts;
    let [hours, minutes] = time.split(':');
    let h = parseInt(hours, 10);
    let m = parseInt(minutes || '0', 10);
    if (h === 12) h = 0;
    if (modifier.toUpperCase() === 'PM') h += 12;
    return h * 60 + m;
  };

  // Find next event for route planner link
  const sameDayEvents = allEvents
    .filter(e => e.date === event.date)
    .sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime));
  
  const eventIndex = sameDayEvents.findIndex(e => e.id === event.id);
  const nextEvent = sameDayEvents[eventIndex + 1];

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = () => {
    openInMaps(event.lat || 0, event.lng || 0, event.title, event.address || event.venue);
  };

  const handleEdit = () => {
    navigation.navigate('CreateEvent', { editEvent: event });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to permanently delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await SalesforceService.deletePastorEvent(event.id);
              Alert.alert('Deleted', 'Event has been deleted.');
              navigation.navigate('Dashboard');
            } catch (err: any) {
              Alert.alert('Delete Failed', err?.message || 'Could not delete event.');
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgPrimary} />
      
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>Event Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Header Info Card */}
        <View style={styles.card}>
          <Text style={[styles.mainTitle, { marginBottom: 16 }]}>{event.title}</Text>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={[styles.timeVal, { marginLeft: 8 }]}>{formatDate(event.date)}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={[styles.timeVal, { marginLeft: 8 }]}>Starts at {event.startTime}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="hourglass-outline" size={18} color={colors.primary} />
              <Text style={[styles.timeVal, { marginLeft: 8, color: colors.textSecondary }]}>
                Time Spent at Event: {event.durationMins >= 60 ? `${Math.round(event.durationMins / 60 * 10) / 10} hours` : `${event.durationMins} mins`}
              </Text>
            </View>
          </View>
        </View>

        {/* Travel Info Card if present */}
        {event.travel && event.travel.distKm > 0 && (
          <View style={[styles.card, { borderColor: colors.primaryMid }]}>
            <Text style={styles.cardLabel}>Travel Estimates from previous stop</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Ionicons name="map-outline" size={18} color={colors.textSecondary} />
              <Text style={{ fontSize: 15, fontWeight: '700', marginLeft: 8, color: colors.textPrimary }}>
                Distance: {event.travel.distKm.toFixed(1)} km
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.bgSecondary, padding: 12, borderRadius: radius.sm }}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="car" size={24} color={colors.primary} />
                <Text style={{ fontSize: 13, fontWeight: '700', marginTop: 4, color: colors.textPrimary }}>{event.travel.car}m</Text>
                <Text style={{ fontSize: 10, color: colors.textTertiary, textTransform: 'uppercase' }}>Car</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="bicycle" size={24} color={colors.primary} />
                <Text style={{ fontSize: 13, fontWeight: '700', marginTop: 4, color: colors.textPrimary }}>{event.travel.bike}m</Text>
                <Text style={{ fontSize: 10, color: colors.textTertiary, textTransform: 'uppercase' }}>Bike</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="bus" size={24} color={colors.primary} />
                <Text style={{ fontSize: 13, fontWeight: '700', marginTop: 4, color: colors.textPrimary }}>{Math.round(event.travel.car * 1.5)}m</Text>
                <Text style={{ fontSize: 10, color: colors.textTertiary, textTransform: 'uppercase' }}>Bus</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="walk" size={24} color={colors.primary} />
                <Text style={{ fontSize: 13, fontWeight: '700', marginTop: 4, color: colors.textPrimary }}>{event.travel.walk}m</Text>
                <Text style={{ fontSize: 10, color: colors.textTertiary, textTransform: 'uppercase' }}>Walk</Text>
              </View>
            </View>
          </View>
        )}

        {/* Venue & Location Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Venue & Location</Text>
          <Text style={styles.venueTitle}>{event.venue}</Text>
          {event.address && event.address !== event.venue && (
            <Text style={styles.addressText}>{event.address}</Text>
          )}

          <TouchableOpacity style={styles.mapsButton} onPress={handleDirections}>
            <Ionicons name="navigate-outline" size={18} color="#FFF" />
            <Text style={styles.mapsButtonText}>Get Directions (External Maps)</Text>
          </TouchableOpacity>
        </View>

        {/* Description Card */}
        {event.description && event.description.replace(/--- Travel Estimation ---[\s\S]*/, '').trim() ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Description</Text>
            <Text style={styles.bodyText}>
              {event.description.replace(/--- Travel Estimation ---[\s\S]*/, '').trim()}
            </Text>
          </View>
        ) : null}

        {/* Notes Card */}
        {event.notes ? (
          <View style={[styles.card, styles.notesCard]}>
            <Text style={[styles.cardLabel, { color: colors.warning }]}>Special Notes</Text>
            <Text style={styles.bodyText}>{event.notes}</Text>
          </View>
        ) : null}

        {/* Contact Details Card */}
        {event.contactName ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Contact Person</Text>
            <View style={styles.contactRow}>
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{event.contactName}</Text>
                {event.contactPhone && <Text style={styles.contactPhone}>{event.contactPhone}</Text>}
              </View>
              {event.contactPhone && (
                <TouchableOpacity style={styles.callButton} onPress={() => handleCall(event.contactPhone!)}>
                  <Ionicons name="call" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : null}

        {/* Next Leg Action Card */}
        {nextEvent && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Next Stop on Itinerary</Text>
            <Text style={styles.nextEventTitle} numberOfLines={1}>{nextEvent.title}</Text>
            <Text style={styles.nextEventTime}>Starts at {nextEvent.startTime}</Text>
            <TouchableOpacity
              style={styles.plannerLink}
              onPress={() => navigation.navigate('RoutePlanner', { events: sameDayEvents })}
            >
              <Text style={styles.plannerLinkText}>Open Route Itinerary</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <TouchableOpacity 
            style={[styles.card, { flex: 1, alignItems: 'center', borderColor: colors.primary }]}
            onPress={handleEdit}
            disabled={deleting}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
            <Text style={{ marginTop: 4, fontWeight: '600', color: colors.primary }}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, { flex: 1, alignItems: 'center', borderColor: colors.error }]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color={colors.error} size="small" />
            ) : (
              <>
                <Ionicons name="trash" size={20} color={colors.error} />
                <Text style={{ marginTop: 4, fontWeight: '600', color: colors.error }}>Delete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  card: {
    backgroundColor: colors.bgPrimary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary
  },
  mainTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  timeVal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  travelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryMid
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark,
    textTransform: 'uppercase'
  },
  travelText: {
    fontSize: 12,
    color: colors.primaryDark,
    marginTop: 2
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs
  },
  venueTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 2
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 10,
    gap: 6
  },
  mapsButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600'
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary
  },
  notesCard: {
    borderColor: colors.primaryMid,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  contactDetails: {
    flex: 1
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  contactPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nextEventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  nextEventTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm
  },
  plannerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  plannerLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary
  }
});

export default PastorEventDetail;
