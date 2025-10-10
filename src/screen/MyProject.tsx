import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NormalHeader from '../component/NormalHeader';
import { useNavigation } from '@react-navigation/native';

const MyProject = () => {
  const navigation = useNavigation<any>();

  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [projectName, setProjectName] = useState('');

  const projects = [
    {
      id: 1,
      name: 'Project Alpha',
    },
    {
      id: 2,
      name: 'Project Orion',
    },
    {
      id: 3,
      name: 'Office Renovation',
    },
    {
      id: 4,
      name: 'Project Nova',
    },
  ];

  const handleProjectPress = (projectName: string) => {
    navigation.navigate('MyProjectDetail', { name: projectName });
  };

  const handleAddProject = () => {
    setShowAddProjectModal(true);
  };

  const handleCloseModal = () => {
    setShowAddProjectModal(false);
    setProjectName('');
  };

  const handleSaveProject = () => {
    if (!projectName.trim()) {
      Alert.alert('Please enter a project name');
      return;
    }
    setShowAddProjectModal(false);
    setShowSuccessModal(true);
    setProjectName('');
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="My Projects" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.projectsContainer}>
          {projects.map(project => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectItem}
              onPress={() => handleProjectPress(project.name)}
              activeOpacity={0.8}
            >
              <View style={styles.projectContent}>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{project.name}</Text>
                </View>
                <Icon name="chevron-right" size={28} color="#000" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Add Project Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddProject}
      >
        <Text style={styles.addButtonText}>Add Project</Text>
      </TouchableOpacity>

      {/* Add Project Modal */}
      <Modal
        visible={showAddProjectModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeader}>Add New Project</Text>
                <Text style={styles.modalSubHeader}>
                  Give your project a name to organize orders
                </Text>

                <TextInput
                  style={styles.projectInput}
                  value={projectName}
                  onChangeText={setProjectName}
                />

                <TouchableOpacity
                  style={[styles.saveButton]}
                  onPress={handleSaveProject}
                  disabled={!projectName.trim()}
                >
                  <Text style={styles.saveButtonText}>Save Project</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSuccessModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseSuccessModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.successModalContent}>
                {/* X Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseSuccessModal}
                >
                  <Icon name="close" size={22} color="#000" />
                </TouchableOpacity>

                {/* Green Tick Icon */}
                <Ionicons
                  name="checkmark-circle"
                  size={70}
                  color="#28a745"
                  style={styles.successIcon}
                />

                {/* Success Message */}
                <Text style={styles.successMessage}>
                  You’ve successfully created a new project!
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default MyProject;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: '16@s',
    paddingBottom: '80@vs',
  },
  projectsContainer: {
    gap: '12@vs',
  },
  projectContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
  },
  projectItem: {
    backgroundColor: '#fff',
    paddingVertical: '8@vs',
    paddingHorizontal: '18@s',
    borderRadius: '10@s',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: '15@ms',
    fontWeight: '500',
    color: '#000',
  },

  floatingButton: {
    position: 'absolute',
    bottom: '20@vs',
    right: '20@s',
    backgroundColor: '#1C3452',
    borderRadius: '10@s',
    paddingHorizontal: '20@s',
    paddingVertical: '10@vs',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: { fontSize: '14@ms', color: '#fff', fontWeight: '400' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '20@s',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '16@s',
    padding: '20@s',
    paddingHorizontal: '30@s',
    width: '90%',
    maxWidth: '340@s',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 10,
  },
  modalHeader: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#000',
    marginBottom: '2@vs',
    textAlign: 'center',
  },
  modalSubHeader: {
    fontSize: '10@s',
    textAlign: 'center',
    color: '#696969',
    marginBottom: '18@vs',
  },
  projectInput: {
    borderWidth: 1,
    borderColor: '#B8B8B8',
    borderRadius: '8@s',
    paddingHorizontal: '12@s',
    paddingVertical: '10@vs',
    fontSize: '14@ms',
    backgroundColor: '#fff',
    marginBottom: '10@vs',
  },
  saveButton: {
    backgroundColor: '#1C3452',
    paddingVertical: '12@vs',
    borderRadius: '8@s',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: '16@ms',
    color: '#fff',
    fontWeight: '400',
  },
  cancelButton: {
    marginTop: '10@vs',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: '14@ms',
    color: '#1C3452',
    fontWeight: '500',
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: '12@s',
    padding: '28@s',
    width: '90%',
    alignItems: 'center',
    elevation: 10,
    position: 'relative',
  },
  successIcon: {
    marginBottom: '15@vs',
  },
  successMessage: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: '10@s',
    right: '10@s',
    padding: '5@s',
  },
});
