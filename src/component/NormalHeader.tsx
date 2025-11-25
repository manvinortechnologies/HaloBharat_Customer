import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { ScaledSheet } from 'react-native-size-matters';
import COLORS from '../constants/colors';

interface NormalHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const NormalHeader: React.FC<NormalHeaderProps> = ({
  title = 'Title',
  showBackButton = true,
}) => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      {showBackButton && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
      )}
      {/* Title */}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default NormalHeader;

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '50@vs',
    paddingHorizontal: '10@s',
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: '5@s',
    marginRight: '10@s',
  },
  title: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: COLORS.black,
  },
});
