import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet, ms, s } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';
import COLORS from '../constants/colors';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  assignProjectItems,
  createProject,
  getProjects,
} from '../api/projects';
import Toast from 'react-native-toast-message';

interface Product {
  id: string;
  name: string;
  vendorName?: string | null;
  quantity: number;
  imageUrl?: string;
  sku?: string | null;
  unitPrice?: string | number | null;
  lineTotal?: string | number | null;
}

type AssignProjectRoute = RouteProp<
  {
    AssignProject: {
      orderId?: string;
      items?: any[];
      initialItemId?: string | null;
      initialAction?: 'new' | 'existing' | null;
    };
  },
  'AssignProject'
>;

const AssignProject = () => {
  const route = useRoute<AssignProjectRoute>();
  const { orderId, items, initialItemId, initialAction } = route.params ?? {};

  const normalizedProducts = useMemo<Product[]>(() => {
    if (!Array.isArray(items)) {
      return [];
    }
    return items.map((item, index) => ({
      id: String(item?.id ?? item?.product_id ?? `product-${index}`),
      name: item?.product_name ?? 'Product',
      vendorName: item?.vendor_name ?? null,
      quantity: Number(item?.quantity ?? 1),
      imageUrl: item?.product_image,
      sku: item?.sku ?? null,
      unitPrice: item?.unit_price ?? null,
      lineTotal: item?.line_total ?? null,
    }));
  }, [items]);

  const [products] = useState<Product[]>(normalizedProducts);

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showExistingProjectModal, setShowExistingProjectModal] =
    useState(false);
  const [projectName, setProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [pendingOrderItemIds, setPendingOrderItemIds] = useState<
    string[] | null
  >(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const autoInitRef = useRef(false);
  const [emptyProjectMessage, setEmptyProjectMessage] = useState<string | null>(
    null,
  );

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const payload = await getProjects();
      const listSource = Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];
      setProjects(
        listSource.map((item: any, index: number) => ({
          id: String(item?.id ?? item?.project_id ?? `project-${index}`),
          title: item?.title ?? item?.name ?? 'Project',
        })),
      );
      listSource.length === 0 &&
        setEmptyProjectMessage(
          'No projects found. Create a project to assign this item.',
        );
    } catch (err: any) {
      setProjects([]);
      setProjectsError(err?.message || 'Unable to load projects.');
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  const openExistingProjectModal = useCallback(
    (orderItemId: string) => {
      setPendingOrderItemIds([orderItemId]);
      setSelectedProject(null);
      if (!projectsLoading && projects.length === 0) {
        setShowExistingProjectModal(false);
        setShowNewProjectModal(true);
        return;
      }
      setShowNewProjectModal(false);
      setShowExistingProjectModal(true);
    },
    [projects.length, projectsLoading],
  );

  const openNewProjectModal = useCallback((orderItemId: string) => {
    setPendingOrderItemIds([orderItemId]);
    setSelectedProject(null);
    setShowExistingProjectModal(false);
    setShowNewProjectModal(true);
  }, []);

  const closeExistingProjectModal = useCallback(() => {
    setShowExistingProjectModal(false);
    setPendingOrderItemIds(null);
    setSelectedProject(null);
  }, []);

  const closeNewProjectModal = useCallback(() => {
    setShowNewProjectModal(false);
    setPendingOrderItemIds(null);
    setEmptyProjectMessage(null);
  }, []);

  useEffect(() => {
    if (autoInitRef.current && projectsLoading) {
      return;
    }
    if (initialItemId && initialAction) {
      autoInitRef.current = true;
      console.log('initialItemId', initialItemId, initialAction);
      if (initialAction === 'existing') {
        openExistingProjectModal(initialItemId);
      } else {
        console.log('initialItemId second', initialItemId, initialAction);
        openNewProjectModal(initialItemId);
      }
    }
  }, [
    initialItemId,
    initialAction,
    // openExistingProjectModal,
    // openNewProjectModal,
    // projects,
    // projectsLoading,
  ]);

  const handleAssignToExistingProject = useCallback(async () => {
    if (!selectedProject || !pendingOrderItemIds?.length) {
      return;
    }
    try {
      setAssignLoading(true);
      await assignProjectItems(selectedProject, pendingOrderItemIds);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Item assigned to the selected project.',
      });
      closeExistingProjectModal();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Assignment Failed',
        text2:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Unable to assign project.',
      });
    } finally {
      setAssignLoading(false);
    }
  }, [pendingOrderItemIds, selectedProject, closeExistingProjectModal]);

  const handleSaveProject = useCallback(async () => {
    const trimmedName = projectName.trim();
    if (!trimmedName) {
      return;
    }

    const orderItemIds = pendingOrderItemIds;
    try {
      setCreatingProject(true);
      const response = await createProject({
        title: trimmedName,
        is_active: true,
      });
      const newProjectId = String(
        response?.id ?? response?.project_id ?? response?.data?.id ?? '',
      );
      setProjectName('');
      closeNewProjectModal();
      await fetchProjects();
      Toast.show({
        type: 'success',
        text1: 'Project Created',
        text2: 'Project has been created successfully.',
      });
      // if (orderItemIds?.length && newProjectId) {
      //   await assignProjectItems(newProjectId, orderItemIds);
      //   Alert.alert('Success', 'Item assigned to the new project.');
      //   setPendingOrderItemIds(null);
      // } else {
      //   Alert.alert(
      //     'Project Created',
      //     'Project has been created successfully.',
      //   );
      // }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Project Creation Failed',
        text2:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Unable to create project.',
      });
    } finally {
      setCreatingProject(false);
    }
  }, [projectName, pendingOrderItemIds, fetchProjects, closeNewProjectModal]);

  const formatPrice = (value?: string | number | null) => {
    if (value == null) return '₹--';
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) return '₹--';
    return `₹${num.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="Assign Project" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.orderMeta}>Order ID: {orderId ?? '--'}</Text>

        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No items available</Text>
            <Text style={styles.emptySubtitle}>
              Complete a checkout to assign items to a project.
            </Text>
          </View>
        ) : (
          products.map(product => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productImageContainer}>
                {product.imageUrl ? (
                  <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Icon name="image" size={s(40)} color={COLORS.primary} />
                )}
              </View>

              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                {product.vendorName ? (
                  <Text style={styles.productSeller}>{product.vendorName}</Text>
                ) : null}
                {product.sku ? (
                  <Text style={styles.productMeta}>SKU: {product.sku}</Text>
                ) : null}
                <Text style={styles.productMeta}>
                  Quantity: {product.quantity}
                </Text>
                <Text style={styles.priceText}>
                  Unit Price: {formatPrice(product.unitPrice)}
                </Text>
                <Text style={styles.priceText}>
                  Line Total: {formatPrice(product.lineTotal)}
                </Text>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openNewProjectModal(product.id)}
                  >
                    <Text style={styles.actionButtonText}>Add New Project</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openExistingProjectModal(product.id)}
                  >
                    <Text style={styles.actionButtonText}>
                      Existing Project
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showNewProjectModal}
        transparent
        animationType="slide"
        onRequestClose={closeNewProjectModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeNewProjectModal}
            >
              <Icon name="close" size={ms(22)} color={COLORS.black} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Add a New Project</Text>
            <Text style={styles.modalSubtitle}>
              Give your project a name to organize orders
            </Text>
            {emptyProjectMessage ? (
              <View style={styles.infoBanner}>
                <Icon name="info-outline" size={18} color={COLORS.primary} />
                <Text style={styles.infoText}>{emptyProjectMessage}</Text>
              </View>
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Enter project name"
              placeholderTextColor={COLORS.gray400}
              value={projectName}
              onChangeText={setProjectName}
            />

            <TouchableOpacity
              style={styles.saveButton}
              disabled={creatingProject}
              onPress={handleSaveProject}
            >
              {creatingProject ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Project</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showExistingProjectModal}
        transparent
        animationType="slide"
        onRequestClose={closeExistingProjectModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeExistingProjectModal}
            >
              <Icon name="close" size={ms(22)} color={COLORS.black} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Select Project</Text>
            {pendingOrderItemIds?.length ? (
              <Text style={styles.pendingInfo}>
                Assigning {pendingOrderItemIds.length}{' '}
                {pendingOrderItemIds.length === 1 ? 'item' : 'items'}
              </Text>
            ) : (
              <Text style={styles.pendingInfoMuted}>
                Select an item to assign.
              </Text>
            )}
            {projectsError ? (
              <TouchableOpacity
                style={styles.errorBanner}
                onPress={fetchProjects}
              >
                <Icon name="error-outline" size={18} color={COLORS.accentRed} />
                <Text style={styles.errorText}>{projectsError}</Text>
                <Text style={styles.retryText}>Tap to retry</Text>
              </TouchableOpacity>
            ) : null}
            {projectsLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loaderText}>Loading projects...</Text>
              </View>
            ) : projects.length === 0 ? (
              <Text style={styles.projectEmptyText}>
                No projects found. Add a new project first.
              </Text>
            ) : (
              projects.map(proj => (
                <TouchableOpacity
                  key={proj.id}
                  style={styles.projectOption}
                  onPress={() => setSelectedProject(proj.id)}
                >
                  <Icon
                    name={
                      selectedProject === proj.id
                        ? 'check-box'
                        : 'check-box-outline-blank'
                    }
                    size={ms(22)}
                    color={
                      selectedProject === proj.id
                        ? COLORS.primary
                        : COLORS.gray500
                    }
                  />
                  <Text style={styles.projectText}>{proj.title}</Text>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!selectedProject ||
                  !pendingOrderItemIds?.length ||
                  assignLoading) &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleAssignToExistingProject}
              disabled={
                !selectedProject ||
                !pendingOrderItemIds?.length ||
                assignLoading
              }
            >
              {assignLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.saveButtonText}>Assign Items</Text>
              )}
            </TouchableOpacity>
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
    backgroundColor: COLORS.gray975,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingVertical: '16@s' },

  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: '16@s',
    marginBottom: '16@vs',
    elevation: 2,
  },
  productImageContainer: {
    width: '80@s',
    height: '80@s',
    borderRadius: '8@s',
    backgroundColor: COLORS.gray1025,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: '8@s',
    resizeMode: 'cover',
  },
  productInfo: { flex: 1, marginLeft: '8@s' },
  productName: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: '2@vs',
  },
  productSeller: {
    fontSize: '13@ms',
    color: COLORS.textSubtle,
    marginBottom: '2@vs',
  },
  productMeta: {
    fontSize: '12@ms',
    color: COLORS.textAsh,
    marginBottom: '4@vs',
  },
  priceText: {
    fontSize: '12@ms',
    color: COLORS.black,
    marginBottom: '2@vs',
  },
  quantityContainer: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '16@vs',
    backgroundColor: COLORS.gray850,
    paddingHorizontal: '4@s',
    borderRadius: '4@s',
  },
  quantityLabel: { fontSize: '13@ms', color: COLORS.black, fontWeight: '500' },
  quantityButton: { marginLeft: '4@s' },
  buttonContainer: { flexDirection: 'row', gap: '6@s' },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: '6@vs',
    borderRadius: '4@s',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: '10@ms',
    fontWeight: '600',
    color: COLORS.white,
  },
  orderMeta: {
    fontSize: '13@ms',
    color: COLORS.textDark,
    marginBottom: '12@vs',
    fontWeight: '600',
    marginHorizontal: '16@s',
  },
  emptyState: {
    paddingVertical: '40@vs',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: COLORS.textSemiDark,
  },
  emptySubtitle: {
    fontSize: '13@ms',
    color: COLORS.textAsh,
    marginTop: '6@vs',
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: COLORS.white,
    borderRadius: '10@s',
    padding: '20@s',
    elevation: 5,
  },
  closeButton: { position: 'absolute', top: '10@s', right: '10@s', zIndex: 10 },
  modalTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: '8@vs',
    marginTop: '10@vs',
  },
  modalSubtitle: {
    fontSize: '13@ms',
    color: COLORS.textSubtle,
    textAlign: 'center',
    marginBottom: '16@vs',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray700,
    borderRadius: '8@s',
    padding: '10@s',
    fontSize: '14@ms',
    color: COLORS.black,
    marginBottom: '16@vs',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: '8@s',
    paddingVertical: '10@vs',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: COLORS.white,
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
    color: COLORS.black,
    fontWeight: '500',
  },
  projectEmptyText: {
    textAlign: 'center',
    color: COLORS.textAsh,
    marginVertical: '12@vs',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    marginBottom: '10@vs',
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
    marginVertical: '10@vs',
  },
  loaderText: {
    fontSize: '12@ms',
    color: COLORS.textDark,
  },
  pendingInfo: {
    textAlign: 'center',
    color: COLORS.textDark,
    marginBottom: '8@vs',
    fontSize: '12@ms',
  },
  pendingInfoMuted: {
    textAlign: 'center',
    color: COLORS.textAsh,
    marginBottom: '8@vs',
    fontSize: '12@ms',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.infoSurface,
    borderRadius: '8@s',
    paddingHorizontal: '10@s',
    paddingVertical: '8@vs',
    gap: '8@s',
    marginBottom: '14@vs',
  },
  infoText: {
    flex: 1,
    fontSize: '12@ms',
    color: COLORS.textDark,
  },
});
