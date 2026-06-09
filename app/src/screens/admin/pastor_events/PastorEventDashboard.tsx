import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  StatusBar
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, radius, typography, shadow } from '../../../theme/Theme';
import { PastorEvent } from '../../../types/event';
import SalesforceService from '../../../services/SalesforceService';
import EventTypeBadge from '../../../components/EventTypeBadge';
import DistanceBadge from '../../../components/DistanceBadge';

import { useFocusEffect } from '@react-navigation/native';

// No hardcoded events fallbacks

export const PastorEventDashboard = ({ navigation }: { navigation: any }) => {
  const [events, setEvents] = useState<PastorEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'past'>('today');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempPickerDate, setTempPickerDate] = useState(new Date());

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const sfEvents = await SalesforceService.getPastorEvents();
      if (sfEvents && sfEvents.length > 0) {
        // Categorize into today, upcoming, past
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const todayStr = `${y}-${m}-${d}`;

        const categorized = sfEvents.map(evt => {
          let section: 'today' | 'upcoming' | 'past' = 'upcoming';
          if (evt.date === todayStr) {
            section = 'today';
          } else if (evt.date < todayStr) {
            section = 'past';
          }
          return { ...evt, section };
        });
        setEvents(categorized);
      } else {
        setEvents([]);
      }
    } catch (e) {
      console.warn('Error querying Salesforce events:', e);
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, []);

  // Filter events based on tab OR selected date filter
  const filteredEvents = selectedDateFilter
    ? events.filter(evt => evt.date === selectedDateFilter)
    : events.filter(evt => evt.section === activeTab);

  // Statistics summaries
  const totalEvents = filteredEvents.length;
  const totalDistance = filteredEvents.reduce((acc, curr) => acc + (curr.travel?.distKm || 0), 0);
  const totalTravelTimeCar = filteredEvents.reduce((acc, curr) => acc + (curr.travel?.car || 0), 0);

  const renderEventCard = ({ item }: { item: PastorEvent }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('EventDetail', { event: item, allEvents: events })}
    >
      <View style={styles.cardHeader}>
        <EventTypeBadge type={item.type} />
        <Text style={styles.timeText}>{item.startTime} ({item.durationMins} mins)</Text>
      </View>
      
      <Text style={styles.titleText}>{item.title}</Text>
      
      <View style={styles.venueRow}>
        <Ionicons name="business" size={14} color={colors.textTertiary} />
        <Text style={styles.venueText} numberOfLines={1}>{item.venue}</Text>
      </View>

      <View style={styles.addressRow}>
        <Ionicons name="map-outline" size={14} color={colors.textTertiary} />
        <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
      </View>

      {item.travel && item.travel.distKm > 0 && (
        <View style={styles.travelContainer}>
          <Text style={styles.travelLabel}>Travel from previous stop:</Text>
          <DistanceBadge distKm={item.travel.distKm} minutes={item.travel.car} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgSecondary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>Pastor's Itinerary</Text>
          <Text style={styles.subtitleText}>Manage schedule & travel routing</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionIconButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionIconButton, { backgroundColor: colors.primary, marginLeft: spacing.sm }]}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <Ionicons name="add" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={tempPickerDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setTempPickerDate(selectedDate);
              const y = selectedDate.getFullYear();
              const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const d = String(selectedDate.getDate()).padStart(2, '0');
              setSelectedDateFilter(`${y}-${m}-${d}`);
            }
          }}
        />
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['today', 'upcoming', 'past'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab, 
              activeTab === tab && !selectedDateFilter && styles.activeTab,
              selectedDateFilter && styles.disabledTab
            ]}
            onPress={() => {
              setSelectedDateFilter(null);
              setActiveTab(tab);
            }}
            disabled={loading}
          >
            <Text style={[styles.tabText, activeTab === tab && !selectedDateFilter && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Filter Indicator Banner */}
      {selectedDateFilter && (
        <View style={styles.filterBanner}>
          <View style={styles.filterBannerLeft}>
            <Ionicons name="funnel-outline" size={14} color={colors.primary} />
            <Text style={styles.filterBannerText}>
              Filtered: {new Date(selectedDateFilter).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.clearFilterButton} 
            onPress={() => setSelectedDateFilter(null)}
          >
            <Text style={styles.clearFilterText}>Show All</Text>
            <Ionicons name="close-circle" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Stats Strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{totalEvents}</Text>
          <Text style={styles.statLbl}>Events</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{totalDistance.toFixed(1)} km</Text>
          <Text style={styles.statLbl}>Travel Dist</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{totalTravelTimeCar} min</Text>
          <Text style={styles.statLbl}>Travel Time</Text>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching Salesforce Events...</Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No events found in this section</Text>
          <Text style={styles.emptySubtext}>Use standard Screen Flows to record new pastor events.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      )}

      {/* Floating Buttons */}
      <View style={styles.floatingButtonsContainer}>
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: colors.success }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('RoutePlanner', { events: filteredEvents })}
        >
          <Ionicons name="trail-sign" size={24} color="#FFF" />
          <Text style={styles.floatingButtonText}>Route Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.floatingButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EventMap', { events: filteredEvents })}
        >
          <Ionicons name="map" size={24} color="#FFF" />
          <Text style={styles.floatingButtonText}>Map View</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm
  },
  welcomeText: {
    ...typography.h1,
    color: colors.primaryDark
  },
  subtitleText: {
    ...typography.caption,
    color: colors.textSecondary
  },
  refreshButton: {
    padding: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.md,
    padding: 2,
    marginVertical: spacing.sm
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm
  },
  activeTab: {
    backgroundColor: colors.bgPrimary,
    ...shadow.card
  },
  tabText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600'
  },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: colors.bgPrimary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...shadow.card
  },
  statBox: {
    alignItems: 'center',
    flex: 1
  },
  statVal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  statLbl: {
    fontSize: 10,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100
  },
  card: {
    backgroundColor: colors.bgPrimary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary
  },
  titleText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  venueText: {
    fontSize: 12,
    color: colors.textSecondary
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm
  },
  addressText: {
    fontSize: 12,
    color: colors.textTertiary
  },
  travelContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  travelLabel: {
    fontSize: 11,
    color: colors.textSecondary
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 14
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.md
  },
  emptySubtext: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    gap: 12
  },
  floatingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 12,
    gap: 8,
    ...shadow.card
  },
  floatingButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionIconButton: {
    padding: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38
  },
  disabledTab: {
    opacity: 0.6
  },
  filterBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    marginHorizontal: spacing.lg,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryMid,
    marginVertical: spacing.xs,
    ...shadow.card
  },
  filterBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  filterBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary
  }
});

export default PastorEventDashboard;
