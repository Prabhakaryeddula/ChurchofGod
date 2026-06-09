import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadow } from '../theme/Theme';

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttons?: AlertButton[];
  onClose?: () => void; // Fallback close
}

export const CustomAlert = ({
  visible,
  title,
  message,
  type = 'info',
  buttons,
  onClose
}: CustomAlertProps) => {

  const getIcon = () => {
    switch (type) {
      case 'success': return <Ionicons name="checkmark-circle" size={48} color={colors.primary} />;
      case 'error': return <Ionicons name="close-circle" size={48} color={colors.error} />;
      case 'warning': return <Ionicons name="warning" size={48} color={colors.warning} />;
      default: return <Ionicons name="information-circle" size={48} color={colors.primary} />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'success': return colors.primary;
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      default: return colors.primary;
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>

          <Text style={[styles.title, { color: getHeaderColor() }]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {buttons && buttons.length > 0 ? (
              buttons.map((btn, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    btn.style === 'cancel' && styles.buttonCancel,
                    btn.style === 'destructive' && styles.buttonDestructive,
                    buttons.length === 2 && styles.buttonHalf
                  ]}
                  onPress={() => {
                    if (btn.onPress) btn.onPress();
                    if (onClose && !btn.onPress) onClose();
                  }}
                >
                  <Text style={[
                    styles.buttonText,
                    btn.style === 'cancel' && styles.buttonTextCancel,
                    btn.style === 'destructive' && styles.buttonTextDestructive
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl
  },
  alertBox: {
    width: width - spacing.xl * 2,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadow.card
  },
  iconContainer: {
    marginBottom: spacing.sm
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: spacing.md
  },
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonHalf: {
    flex: 1
  },
  buttonCancel: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border
  },
  buttonDestructive: {
    backgroundColor: colors.error
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  buttonTextCancel: {
    color: colors.textPrimary
  },
  buttonTextDestructive: {
    color: '#FFFFFF'
  }
});
