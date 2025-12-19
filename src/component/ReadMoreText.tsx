import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import COLORS from '../constants/colors';
/**
 * Renders truncated text that can be expanded inside a modal.
 * Shows the trigger only when the content exceeds the provided line limit.
 */

const ReadMoreText = ({
  text = '',
  numberOfLines = 3,
  title = 'Details',
  triggerLabel = 'read more',
  containerStyle,
  textStyle,
  triggerTextStyle,
  modalTitleStyle,
  modalTextStyle,
  renderTrigger,
}: {
  text?: string;
  numberOfLines?: number;
  title?: string;
  triggerLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  triggerTextStyle?: StyleProp<TextStyle>;
  modalTitleStyle?: StyleProp<TextStyle>;
  modalTextStyle?: StyleProp<TextStyle>;
  renderTrigger?: (openModal: () => void) => React.ReactNode;
}) => {
  const [isTruncatable, setIsTruncatable] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const content = useMemo(() => {
    if (typeof text === 'string') {
      const trimmed = text.trim();
      return trimmed.length ? trimmed : 'No description provided';
    }

    if (text === null || text === undefined) {
      return 'No description provided';
    }

    const converted = String(text).trim();
    return converted.length ? converted : 'No description provided';
  }, [text]);

  const handleTextLayout = useCallback(
    (event: NativeSyntheticEvent<{ lines: Array<{ text: string }> }>) => {
      const lines = event.nativeEvent.lines || [];
      console.log('lines', event.nativeEvent);
      if (lines.length > numberOfLines) {
        setIsTruncatable(true);
      }
    },
    [numberOfLines],
  );

  const openModal = useCallback(() => setIsModalVisible(true), []);
  const closeModal = useCallback(() => setIsModalVisible(false), []);

  return (
    <View style={containerStyle}>
      <Text
        numberOfLines={numberOfLines}
        ellipsizeMode="tail"
        style={textStyle}
        onTextLayout={!isTruncatable ? handleTextLayout : undefined}
      >
        {content}
      </Text>

      {isTruncatable &&
        (renderTrigger ? (
          renderTrigger(openModal)
        ) : (
          <TouchableOpacity activeOpacity={0.7} onPress={openModal}>
            <Text style={[styles.triggerText, triggerTextStyle]}>
              {triggerLabel}
            </Text>
          </TouchableOpacity>
        ))}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, modalTitleStyle]}>{title}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalText, modalTextStyle]}>{content}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = ScaledSheet.create({
  triggerText: {
    color: COLORS.primary,
    marginBottom: '4@s',
    fontSize: '10@s',
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlayMedium,
    justifyContent: 'center',
    paddingHorizontal: '24@s',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: '16@s',
    padding: '20@s',
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: '18@s',
    fontWeight: '700',
    marginBottom: '12@s',
    color: COLORS.black,
  },
  modalText: {
    fontSize: '12@s',
    color: COLORS.textMedium,
    lineHeight: '22@s',
  },
  closeButton: {
    marginTop: '16@s',
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: COLORS.primary,
    fontSize: '16@s',
    fontWeight: '600',
  },
});

export default ReadMoreText;
