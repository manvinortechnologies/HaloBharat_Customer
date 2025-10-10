import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';

const ReturnOrder = () => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const reasons = [
    'Placed the order by mistake',
    'Changed my requirements',
    'Delivery taking too long',
    'Selected the wrong item',
    'Other reason',
  ];

  const handleReturn = () => {
    setShowModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="Return Order" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Details Section */}
        <View style={styles.productCard}>
          <Image
            source={require('../assets/orderImg1.png')}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.productDetails}>
            <Text style={styles.productTitle}>
              Cinder Blocks / Concrete Hollow Blocks
            </Text>
            <Text style={styles.seller}>Seller - Cemex</Text>

            <View style={styles.qtyBox}>
              <Text style={styles.qtyText}>Qty - 5 Packs</Text>
            </View>

            <View style={styles.qtyRow}>
              <View style={styles.deliveryTag}>
                <Text style={styles.deliveryText}>Delivery by 27 Sept</Text>
              </View>
              <Text style={styles.priceText}>Rs 4285</Text>
            </View>
          </View>
        </View>

        {/* Reason for Return Section */}
        <View style={styles.reasonSection}>
          <Text style={styles.reasonLabel}>Reason for return</Text>

          <TextInput
            placeholder="Write reason (optional)"
            style={styles.textInput}
            multiline
          />

          {reasons.map((reason, index) => (
            <TouchableOpacity
              key={index}
              style={styles.reasonRow}
              onPress={() => setSelectedReason(reason)}
            >
              <View style={styles.checkbox}>
                {selectedReason === reason && (
                  <View style={styles.checkedBox} />
                )}
              </View>
              <Text style={styles.reasonText}>{reason}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Return Order Button */}
        <TouchableOpacity
          style={[
            styles.returnButton,
            !selectedReason && styles.returnButtonDisabled,
          ]}
          disabled={!selectedReason}
          onPress={handleReturn}
        >
          <Text style={styles.returnButtonText}>Return Order</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        transparent
        visible={showModal}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Icon name="close" size={22} color="#000" />
            </TouchableOpacity>

            {/* Success Content */}
            <View style={styles.modalContent}>
              <View style={styles.titleRow}>
                <Text style={styles.modalTitle}>
                  Return Initiated Successfully
                </Text>
                <Icon
                  name="check-circle"
                  size={22}
                  color="#28A745"
                  style={{ marginLeft: 6 }}
                />
              </View>

              <Text style={styles.modalSubtitle}>
                Return initiated! We’ll update you once your item is processed.
              </Text>

              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.exploreButtonText}>Explore More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ReturnOrder;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
  scrollView: {
    flex: 1,
  },
  // Product Section
  productCard: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: '10@s',
    padding: '12@s',
    paddingHorizontal: '16@s',
    marginTop: '10@vs',
    marginBottom: '20@vs',
    position: 'relative',
  },
  productImage: {
    width: '80@s',
    height: '80@s',
    borderRadius: '8@s',
  },
  productDetails: {
    flex: 1,
    marginLeft: '10@s',
  },
  productTitle: {
    fontSize: '14@ms',
    color: '#000',
    fontWeight: '600',
  },
  seller: {
    fontSize: '12@ms',
    color: '#666',
    marginTop: '4@vs',
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6@vs',
  },
  qtyBox: {
    backgroundColor: '#E0E3E4',
    width: '40%',
    alignItems: 'center',
    marginTop: '5@s',
  },
  qtyText: {
    fontSize: '12@ms',
    color: '#000',
  },
  deliveryTag: {
    backgroundColor: '#D66651',
    paddingHorizontal: '6@s',
    paddingVertical: '2@vs',
  },
  deliveryText: {
    fontSize: '10@ms',
    color: '#fff',
  },
  priceText: {
    alignItems: 'flex-end',
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#000',
  },

  // Reason Section
  reasonSection: {
    marginBottom: '30@vs',
    backgroundColor: '#fff',
    paddingHorizontal: '16@s',
  },
  reasonLabel: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#000',
    marginBottom: '8@vs',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: '8@s',
    padding: '10@s',
    marginBottom: '16@vs',
    fontSize: '14@ms',
    textAlignVertical: 'top',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '12@vs',
  },
  checkbox: {
    width: '20@s',
    height: '20@s',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: '4@s',
    marginRight: '10@s',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    width: '12@s',
    height: '12@s',
    backgroundColor: '#1C3452',
    borderRadius: '2@s',
  },
  reasonText: {
    fontSize: '14@ms',
    color: '#333',
  },

  // Button
  returnButton: {
    backgroundColor: '#1C3452',
    borderRadius: '8@s',
    paddingVertical: '14@vs',
    alignItems: 'center',
    marginBottom: '40@vs',
    marginHorizontal: '30@s',
  },
  returnButtonDisabled: {
    backgroundColor: '#ccc',
  },
  returnButtonText: {
    color: '#fff',
    fontSize: '16@ms',
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: '12@s',
    padding: '20@s',
    position: 'relative',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: '10@s',
    right: '10@s',
  },
  modalContent: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '10@vs',
  },
  modalTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#000',
  },
  modalSubtitle: {
    fontSize: '10@ms',
    color: '#696969',
    textAlign: 'center',
    marginVertical: '2@vs',
    lineHeight: '18@vs',
  },
  exploreButton: {
    backgroundColor: '#1C3452',
    borderRadius: '8@s',
    paddingVertical: '6@vs',
    paddingHorizontal: '25@s',
    marginTop: '10@vs',
  },
  exploreButtonText: {
    color: '#fff',
    fontWeight: '400',
    fontSize: '14@ms',
  },
});
