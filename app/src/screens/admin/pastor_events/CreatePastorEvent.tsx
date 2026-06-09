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
import { colors, spacing, radius, typography, shadow } from '../../../theme/Theme';
import SalesforceService from '../../../services/SalesforceService';
import { useAuth } from '../../../context/AuthContext';

export const CreatePastorEvent = ({ navigation }: { navigation: any }) => {
  const { member } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fallbackContactId, setFallbackContactId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('worship');
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [durationMins, setDurationMins] = useState('60');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  // Advanced / Travel Info State
  const [lat, setLat] = useState('16.3067');
  const [lng, setLng] = useState('80.4365');
  const [distKm, setDistKm] = useState('3.5');
  const [carMins, setCarMins] = useState('12');
  const [bikeMins, setBikeMins] = useState('8');
  const [walkMins, setWalkMins] = useState('45');

  // UI state for Pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

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

  const eventTypes = [
    { label: 'Worship Service', value: 'worship' },
    { label: 'Prayer Fellowship', value: 'prayer' },
    { label: 'Leadership Meeting', value: 'meeting' },
    { label: 'Community Outreach', value: 'outreach' },
    { label: 'Pastoral Visit / Funeral', value: 'funeral' }
  ];

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
      // Calculate start and end date times
      const startDateTime = new Date(date);
      startDateTime.setHours(startTime.getHours());
      startDateTime.setMinutes(startTime.getMinutes());
      startDateTime.setSeconds(0);
      startDateTime.setMilliseconds(0);

      const duration = parseInt(durationMins, 10) || 60;
      const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

      // Construct Salesforce Event payload
      const payload = {
        Subject: title,
        StartDateTime: startDateTime.toISOString(),
        EndDateTime: endDateTime.toISOString(),
        Location: address.trim(),
        Description: description.trim(),
        WhoId: targetContactId, // Link to Contact record
        Event_Type__c: eventType,
        Notes__c: notes.trim(),
        Latitude__c: parseFloat(lat) || 0,
        Longitude__c: parseFloat(lng) || 0,
        Distance_Km__c: parseFloat(distKm) || 0,
        Travel_Car_Mins__c: parseInt(carMins, 10) || 0,
        Travel_Bike_Mins__c: parseInt(bikeMins, 10) || 0,
        Travel_Walk_Mins__c: parseInt(walkMins, 10) || 0
      };

      const success = await SalesforceService.createPastorEvent(payload);
      
      if (success) {
        Alert.alert(
          'Success', 
          'Pastor event created successfully under your contact record in Salesforce!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'Failed to save event to Salesforce. Please try again.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An unexpected error occurred.');
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
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowTypeDropdown(!showTypeDropdown)}>
              <Text style={styles.dropdownText}>
                {eventTypes.find(t => t.value === eventType)?.label || eventType}
              </Text>
              <Ionicons name={showTypeDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            
            {showTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {eventTypes.map(t => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.dropdownItem, eventType === t.value && styles.dropdownItemActive]}
                    onPress={() => {
                      setEventType(t.value);
                      setShowTypeDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, eventType === t.value && styles.dropdownItemTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (Minutes)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={durationMins}
              onChangeText={setDurationMins}
            />
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

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={lat}
                onChangeText={setLat}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.md }]}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={lng}
                onChangeText={setLng}
              />
            </View>
          </View>
        </View>

        {/* Travel Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Travel Estimations (Route Planner)</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Distance (km)</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={distKm}
                onChangeText={setDistKm}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.md }]}>
              <Text style={styles.label}>Car (mins)</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={carMins}
                onChangeText={setCarMins}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Bike (mins)</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={bikeMins}
                onChangeText={setBikeMins}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.md }]}>
              <Text style={styles.label}>Walk (mins)</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={walkMins}
                onChangeText={setWalkMins}
              />
            </View>
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
