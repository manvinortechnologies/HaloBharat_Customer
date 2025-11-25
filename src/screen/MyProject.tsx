import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ActivityIndicator, RefreshControl } from 'react-native';
import {
  FlatList,
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
import COLORS from '../constants/colors';
import { createProject, getProjects } from '../api/projects';

const MyProject = () => {
  const navigation = useNavigation<any>();

  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const normalizeProject = useCallback((item: any, index: number) => {
    return {
      id: String(item?.id ?? item?.project_id ?? `project-${index}`),
      name: item?.name ?? item?.title ?? 'Project',
      status: item?.status ?? 'Active',
      siteName: item?.site_name ?? item?.site ?? null,
      createdAt: item?.created_at ?? item?.createdAt ?? null,
    };
  }, []);

  const fetchProjects = useCallback(
    async (mode: 'default' | 'refresh' = 'default', page: number = 1) => {
      if (mode === 'refresh') {
        setRefreshing(true);
        setCurrentPage(1);
        setHasMore(true);
      } else if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      try {
        const payload = await getProjects({ page });
        const listSource = payload.results || [];

        const normalizedProjects = listSource.map(normalizeProject);

        if (page === 1) {
          setProjects(normalizedProjects);
        } else {
          setProjects(prev => [...prev, ...normalizedProjects]);
        }

        const totalPagesCount = payload?.total_pages ?? 1;
        const currentPageNum = payload?.current_page ?? page;
        const hasNextPage =
          payload?.next !== null && currentPageNum < totalPagesCount;

        setTotalPages(totalPagesCount);
        setCurrentPage(currentPageNum);
        setHasMore(hasNextPage);
      } catch (err: any) {
        setError(err?.message || 'Unable to load projects.');
        if (page === 1) {
          setProjects([]);
        }
      } finally {
        if (mode === 'refresh') {
          setRefreshing(false);
        } else if (page === 1) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [normalizeProject],
  );

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading && !refreshing) {
      const nextPage = currentPage + 1;
      fetchProjects('default', nextPage);
    }
  }, [currentPage, hasMore, loadingMore, loading, refreshing, fetchProjects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleProjectPress = (projectId: string, projectName: string) => {
    navigation.navigate('MyProjectDetail', {
      projectId,
      name: projectName,
    });
  };

  const handleAddProject = () => {
    setShowAddProjectModal(true);
  };

  const handleCloseModal = () => {
    setShowAddProjectModal(false);
    setProjectName('');
  };

  const handleSaveProject = useCallback(async () => {
    const trimmedName = projectName.trim();
    if (!trimmedName) {
      Alert.alert('Please enter a project name');
      return;
    }
    try {
      setCreatingProject(true);
      await createProject({ title: trimmedName, is_active: true });
      setProjectName('');
      setShowAddProjectModal(false);
      setShowSuccessModal(true);
      fetchProjects('refresh', 1);
    } catch (error: any) {
      Alert.alert(
        'Project Creation Failed',
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Unable to create project.',
      );
    } finally {
      setCreatingProject(false);
    }
  }, [projectName, fetchProjects]);

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const renderProjectItem = useCallback(
    ({ item: project }: { item: any }) => (
      <TouchableOpacity
        style={styles.projectItem}
        onPress={() => handleProjectPress(project.id, project.name)}
        activeOpacity={0.8}
      >
        <View style={styles.projectContent}>
          <View style={styles.projectInfo}>
            <Text style={styles.projectName}>{project.name}</Text>
            {project.siteName ? (
              <Text style={styles.projectSite}>{project.siteName}</Text>
            ) : null}
            {project.createdAt ? (
              <Text style={styles.projectMeta}>
                Created on{' '}
                {new Date(project.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            ) : null}
          </View>
          <View style={styles.projectStatus}>
            <Text style={styles.projectStatusText}>
              {project.status ?? 'Active'}
            </Text>
          </View>
          <Icon name="chevron-right" size={28} color={COLORS.black} />
        </View>
      </TouchableOpacity>
    ),
    [],
  );

  const renderListHeader = useCallback(() => {
    if (error) {
      return (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => fetchProjects('default', 1)}
        >
          <Icon name="error-outline" size={20} color={COLORS.accentRed} />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      );
    }
    return null;
  }, [error, fetchProjects]);

  const renderListEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading projects...</Text>
        </View>
      );
    }
    if (!error) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="assignment" size={48} color={COLORS.gray700} />
          <Text style={styles.emptyTitle}>No projects yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap "Add Project" to create your first project
          </Text>
        </View>
      );
    }
    return null;
  }, [loading, error]);

  const renderListFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading more projects...</Text>
        </View>
      );
    }
    return null;
  }, [loadingMore]);

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="My Projects" />
      <FlatList
        data={projects}
        renderItem={renderProjectItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProjects('refresh', 1)}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />

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
                  style={[
                    styles.saveButton,
                    (!projectName.trim() || creatingProject) &&
                      styles.saveButtonDisabled,
                  ]}
                  onPress={handleSaveProject}
                  disabled={!projectName.trim() || creatingProject}
                >
                  {creatingProject ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Project</Text>
                  )}
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
                  <Icon name="close" size={22} color={COLORS.black} />
                </TouchableOpacity>

                {/* Green Tick Icon */}
                <Ionicons
                  name="checkmark-circle"
                  size={70}
                  color={COLORS.success}
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
    backgroundColor: COLORS.gray975,
  },
  scrollContent: {
    paddingVertical: '16@s',
    paddingBottom: '80@vs',
    paddingHorizontal: '18@s',
  },
  projectContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginVertical: 10,
    padding: '12@s',
    alignItems: 'center',
  },
  projectItem: {
    backgroundColor: COLORS.white,
    paddingVertical: '8@vs',
    marginBottom: '12@vs',
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
    color: COLORS.black,
  },
  projectSite: {
    fontSize: '12@ms',
    color: COLORS.textAsh,
    marginTop: '4@vs',
  },
  projectMeta: {
    fontSize: '11@ms',
    color: COLORS.textSubtle,
    marginTop: '4@vs',
  },
  projectStatus: {
    backgroundColor: COLORS.infoSurface,
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    borderRadius: '6@s',
    marginRight: '8@s',
  },
  projectStatusText: {
    fontSize: '11@ms',
    color: COLORS.primary,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    marginHorizontal: '20@s',
    marginBottom: '12@vs',
    gap: '8@s',
  },
  errorText: {
    flex: 1,
    fontSize: '12@ms',
    color: COLORS.textDark,
  },
  retryText: {
    fontSize: '12@ms',
    color: COLORS.primary,
    fontWeight: '600',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8@s',
    paddingVertical: '16@vs',
  },
  loaderText: {
    fontSize: '13@ms',
    color: COLORS.textDark,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: '40@vs',
    gap: '8@vs',
  },
  emptyTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: COLORS.textSemiDark,
  },
  emptySubtitle: {
    fontSize: '13@ms',
    color: COLORS.textAsh,
    textAlign: 'center',
  },

  floatingButton: {
    position: 'absolute',
    bottom: '20@vs',
    right: '20@s',
    backgroundColor: COLORS.primary,
    borderRadius: '10@s',
    paddingHorizontal: '20@s',
    paddingVertical: '10@vs',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: { fontSize: '14@ms', color: COLORS.white, fontWeight: '400' },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayStrong,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '20@s',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: '16@s',
    padding: '20@s',
    paddingHorizontal: '30@s',
    width: '90%',
    maxWidth: '340@s',
    shadowColor: COLORS.black,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 10,
  },
  modalHeader: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: '2@vs',
    textAlign: 'center',
  },
  modalSubHeader: {
    fontSize: '10@s',
    textAlign: 'center',
    color: COLORS.textAsh,
    marginBottom: '18@vs',
  },
  projectInput: {
    borderWidth: 1,
    borderColor: COLORS.gray600,
    borderRadius: '8@s',
    paddingHorizontal: '12@s',
    paddingVertical: '10@vs',
    fontSize: '14@ms',
    backgroundColor: COLORS.white,
    marginBottom: '10@vs',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: '12@vs',
    borderRadius: '8@s',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray700,
  },
  saveButtonText: {
    fontSize: '16@ms',
    color: COLORS.white,
    fontWeight: '400',
  },
  cancelButton: {
    marginTop: '10@vs',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: '14@ms',
    color: COLORS.primary,
    fontWeight: '500',
  },
  successModalContent: {
    backgroundColor: COLORS.white,
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
    color: COLORS.black,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: '10@s',
    right: '10@s',
    padding: '5@s',
  },
});
