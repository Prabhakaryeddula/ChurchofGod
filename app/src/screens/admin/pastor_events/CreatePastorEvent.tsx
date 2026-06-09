import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { colors, spacing, radius, typography, shadow } from '../../../theme/Theme';
import SalesforceService from '../../../services/SalesforceService';
import { useAuth } from '../../../context/AuthContext';

export const CreatePastorEvent = ({ navigation }: { navigation: any }) => {
  const { member } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fallbackContactId, setFallbackContactId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [durationMins, setDurationMins] = useState('60');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  // UI state for Pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    // If not authenticated or member profile is missing, search Salesforce for an admin contact
    if (!member?.id) {
      const loadFallbackContact = async () => {
        try {
          const admins = await SalesforceService.getAdminMembers();
          if (admins && admins.length > 0) {
            setFallbackContactId(admins[0].Id);
          }
        } catch (e) {
          console.warn('Failed to load fallback admin contact', e);
        }
      };
      loadFallbackContact();
    }
  }, [member]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter an event title.');
      return;
    }
    if (!venue.trim()) {
      Alert.alert('Validation Error', 'Please enter a venue name.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Validation Error', 'Please enter a full address for maps integration.');
      return;
    }

    const targetContactId = member?.id || fallbackContactId;
    if (!targetContactId) {
      Alert.alert('Salesforce Error', 'Could not locate an Admin Contact record to link this event to. Please check your internet connection.');
      return;
    }

    setLoading(true);

    try {
      // Calculate start and end date times (defaulting event duration to 1 hour since we removed the manual duration field)
      const startDateTime = new Date(date);
      startDateTime.setHours(startTime.getHours());
      startDateTime.setMinutes(startTime.getMinutes());
      startDateTime.setSeconds(0);
      startDateTime.setMilliseconds(0);

      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

      // Build full address with PIN code for geocoding
      const fullAddress = pinCode
        ? `${address.trim()}, ${pinCode.trim()}`
        : address.trim();

      // --- Location & Distance Calculation ---
      let travelInfo = '';
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const { latitude, longitude } = location.coords;
          
          const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';
          if (GOOGLE_KEY) {
            // Reverse geocode current location
            let currentLocationStr = 'Current Location';
            const revGeoResp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_KEY}`);
            const revGeoData = await revGeoResp.json();
            if (revGeoData.status === 'OK' && revGeoData.results.length > 0) {
              currentLocationStr = revGeoData.results[0].formatted_address;
            }
            
            // Get Distance & Time
            const distResp = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${latitude},${longitude}&destinations=${encodeURIComponent(fullAddress)}&key=${GOOGLE_KEY}`);
            const distData = await distResp.json();
            
            if (distData.status === 'OK' && distData.rows[0].elements[0].status === 'OK') {
              const distElement = distData.rows[0].elements[0];
              travelInfo = `\n\n--- Travel Estimation ---\nDistance: ${distElement.distance.text}\nTravel Time: ${distElement.duration.text}\nStarting From: ${currentLocationStr}`;
            }
          }
        }
      } catch (err) {
        console.warn('Location calculation error:', err);
      }

      // Construct Salesforce Event payload — only standard fields that definitely exist
      const payload: any = {
        Subject: title,
        StartDateTime: startDateTime.toISOString(),
        EndDateTime: endDateTime.toISOString(),
        Location: `${venue.trim()} — ${fullAddress}`,
        Description: `${description.trim()}${notes.trim() ? `\n\nNotes: ${notes.trim()}` : ''}${travelInfo}`,
      };

      // Only add WhoId if we have a valid contact
      if (targetContactId) {
        payload.WhoId = targetContactId;
      }

      await SalesforceService.createPastorEvent(payload);

      Alert.alert(
        '✅ Success',
        'Pastor event created successfully in Salesforce!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      const msg = e?.message || 'An unexpected error occurred.';
      console.error('❌ [CreatePastorEvent] Save failed:', msg);
      Alert.alert('Save Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgPrimary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Pastor Event</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Basic Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Event Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sunday Service & Prayer"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Type</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Worship Service, Prayer Meeting"
              value={eventType}
              onChangeText={setEventType}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dropdownText}>
                  {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.md }]}>
              <Text style={styles.label}>Start Time *</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.dropdownText}>
                  {startTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) setStartTime(selectedTime);
                  }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Location & Address Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location & Geolocation</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Venue Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Calvary Temple, Guntur"
              value={venue}
              onChangeText={setVenue}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Address * (Used for Maps Routing)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Ring Road, Arundelpet, Guntur, AP, 522002"
              multiline
              numberOfLines={3}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PIN Code (improves map accuracy)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 522002"
              keyboardType="numeric"
              maxLength={10}
              value={pinCode}
              onChangeText={setPinCode}
            />
          </View>

          <View style={[styles.inputGroup, { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#bbf7d0' }]}>
            <Ionicons name="location" size={14} color="#15803D" />
            <Text style={{ fontSize: 11, color: '#15803D', fontWeight: '500', flex: 1 }}>
              Latitude, Longitude &amp; Travel times are auto-computed from the address — no manual entry needed.
            </Text>
          </View>
        </View>

        {/* Descriptions & Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Context</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What is this itinerary appointment for?"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Special Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any items to bring, contacts to meet, or preparations to make?"
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Create Salesforce Event</Text>
            </>
          )}
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
  header: {
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
  headerTitle: {
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
  cardTitle: {
    ...typography.h3,
    color: colors.primaryDark,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgTertiary,
    paddingBottom: spacing.xs
  },
  inputGroup: {
    marginBottom: spacing.md
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.bgSecondary
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  row: {
    flexDirection: 'row'
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    backgroundColor: colors.bgSecondary
  },
  dropdownText: {
    fontSize: 14,
    color: colors.textPrimary
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
    backgroundColor: colors.bgPrimary,
    ...shadow.card
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgTertiary
  },
  dropdownItemActive: {
    backgroundColor: colors.primaryLight
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.textPrimary
  },
  dropdownItemTextActive: {
    color: colors.primary,
    fontWeight: '600'
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    gap: 8,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    ...shadow.card
  },
  saveButtonDisabled: {
    backgroundColor: colors.textTertiary
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700'
  }
});

export default CreatePastorEvent;
