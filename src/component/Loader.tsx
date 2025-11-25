import React from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

interface LoaderProps {
  visible: boolean;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ visible, message = 'Loading...' }) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default Loader;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '70%',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  message: {
    fontSize: 14,
    color: COLORS.black,
  },
});

