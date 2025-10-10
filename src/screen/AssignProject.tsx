import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet, ms } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';

interface Product {
  id: string;
  name: string;
  seller: string;
  quantity: number;
  image: any;
}

const PROJECTS = ['Project Alpha', 'Project Origin', 'Office', 'Project Nova'];

const AssignProject = () => {
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Cinder Blocks / Concrete Hollow Blocks',
      seller: 'Seller - Cemex',
      quantity: 5,
      image: require('../assets/product1.png'),
    },
    {
      id: '2',
      name: 'Cinder Blocks / Concrete Hollow Blocks',
      seller: 'Seller - Cemex',
      quantity: 5,
      image: require('../assets/product2.png'),
    },
  ]);

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showExistingProjectModal, setShowExistingProjectModal] =
    useState(false);
  const [projectName, setProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // --- Event Handlers ---
  const handleAddNewProject = () => {
    setShowExistingProjectModal(false);
    setShowNewProjectModal(true);
  };

  const handleAddToExistingProject = () => {
    setShowNewProjectModal(false);
    setShowExistingProjectModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="Assign Project" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {products.map(product => (
          <View key={product.id} style={styles.productCard}>
            <Image
              source={product.image}
              style={styles.productImage}
              resizeMode="cover"
            />

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productSeller}>{product.seller}</Text>

              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>
                  Qty - {product.quantity} Packs
                </Text>
                <TouchableOpacity style={styles.quantityButton}>
                  <Icon name="keyboard-arrow-down" size={20} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleAddNewProject}
                >
                  <Text style={styles.actionButtonText}>Add New Project</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleAddToExistingProject}
                >
                  <Text style={styles.actionButtonText}>
                    Add to Existing Project
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ------------------ Add New Project Modal ------------------ */}
      <Modal
        visible={showNewProjectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewProjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Close */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNewProjectModal(false)}
            >
              <Icon name="close" size={ms(22)} color="#000" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Add a New Project</Text>
            <Text style={styles.modalSubtitle}>
              Give your project a name to organize orders
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter project name"
              placeholderTextColor="#999"
              value={projectName}
              onChangeText={setProjectName}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                if (projectName.trim()) {
                  console.log('Saved project:', projectName);
                  setShowNewProjectModal(false);
                  setProjectName('');
                }
              }}
            >
              <Text style={styles.saveButtonText}>Save Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ------------------ Existing Project Modal ------------------ */}
      <Modal
        visible={showExistingProjectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExistingProjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowExistingProjectModal(false)}
            >
              <Icon name="close" size={ms(22)} color="#000" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Select Project</Text>

            {PROJECTS.map(proj => (
              <TouchableOpacity
                key={proj}
                style={styles.projectOption}
                onPress={() => setSelectedProject(proj)}
              >
                <Icon
                  name={
                    selectedProject === proj
                      ? 'check-box'
                      : 'check-box-outline-blank'
                  }
                  size={ms(22)}
                  color={selectedProject === proj ? '#1C3452' : '#aaa'}
                />
                <Text style={styles.projectText}>{proj}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AssignProject;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingVertical: '16@s' },

  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: '16@s',
    marginBottom: '16@vs',
    elevation: 2,
  },
  productImage: {
    width: '80@s',
    height: '80@s',
    borderRadius: '8@s',
    backgroundColor: '#F5F5F5',
  },
  productInfo: { flex: 1, marginLeft: '8@s' },
  productName: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#000',
    marginBottom: '2@vs',
  },
  productSeller: { fontSize: '13@ms', color: '#666', marginBottom: '2@vs' },
  quantityContainer: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '16@vs',
    backgroundColor: '#E0E3E4',
    paddingHorizontal: '4@s',
    borderRadius: '4@s',
  },
  quantityLabel: { fontSize: '13@ms', color: '#000', fontWeight: '500' },
  quantityButton: { marginLeft: '4@s' },
  buttonContainer: { flexDirection: 'row', gap: '6@s' },
  actionButton: {
    flex: 1,
    backgroundColor: '#1C3452',
    paddingVertical: '6@vs',
    borderRadius: '4@s',
    alignItems: 'center',
  },
  actionButtonText: { fontSize: '10@ms', fontWeight: '600', color: '#fff' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: '10@s',
    padding: '20@s',
    elevation: 5,
  },
  closeButton: { position: 'absolute', top: '10@s', right: '10@s', zIndex: 10 },
  modalTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: '8@vs',
    marginTop: '10@vs',
  },
  modalSubtitle: {
    fontSize: '13@ms',
    color: '#666',
    textAlign: 'center',
    marginBottom: '16@vs',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: '8@s',
    padding: '10@s',
    fontSize: '14@ms',
    color: '#000',
    marginBottom: '16@vs',
  },
  saveButton: {
    backgroundColor: '#1C3452',
    borderRadius: '8@s',
    paddingVertical: '10@vs',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: '13@ms',
  },
  projectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: '4@vs',
  },
  projectText: {
    marginLeft: '8@s',
    fontSize: '14@ms',
    color: '#000',
    fontWeight: '500',
  },
});
