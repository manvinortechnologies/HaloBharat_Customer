import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NormalHeader from '../component/NormalHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import { s, ScaledSheet } from 'react-native-size-matters';
import COLORS from '../constants/colors';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { getProjectDetail, getProjectProducts } from '../api/projects';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type ProjectDetailRoute = RouteProp<
  {
    MyProjectDetail: {
      projectId?: string;
      name?: string;
    };
  },
  'MyProjectDetail'
>;

interface ProjectItem {
  id: string;
  name: string;
  image?: string | null;
  quantity?: number | null;
  status?: string | null;
}

type RootStackParamList = {
  MyProjectDetail: {
    projectId: string;
    name: string;
  };
  ProductDetail: {
    productId: string;
  };
};

const MyProjectDetail = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ProjectDetailRoute>();
  const { projectId, name: fallbackTitle } = route.params ?? {};

  const [project, setProject] = useState<any | null>(null);
  const [projectProducts, setProjectProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeItem = useCallback((item: any, index: number): ProjectItem => {
    return {
      id: String(item?.product?.id ?? `item-${index}`),
      name:
        item?.product_name ?? item?.name ?? item?.title ?? `Item ${index + 1}`,
      image: item?.product_image ?? item?.image ?? null,
      quantity:
        item?.quantity ??
        item?.qty ??
        (typeof item?.count === 'number' ? item.count : null),
      status: item?.status_display ?? item?.status ?? null,
    };
  }, []);

  const fetchProject = useCallback(
    async (mode: 'default' | 'refresh' = 'default') => {
      if (!projectId) {
        setError('Project id missing.');
        return;
      }
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        setError(null);
        const response = await getProjectDetail(projectId);
        setProject(response);
      } catch (err: any) {
        setProject(null);
        setError(err?.message || 'Unable to load project details.');
      } finally {
        if (mode === 'refresh') {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [projectId],
  );

  const fetchProjectProducts = useCallback(
    async (mode: 'default' | 'refresh' = 'default') => {
      if (!projectId) {
        return;
      }
      if (mode === 'refresh') {
        // Products will be refreshed with project
      } else {
        setProductsLoading(true);
      }
      try {
        const response = await getProjectProducts(projectId);
        setProjectProducts(response?.results || []);
      } catch (err: any) {
        console.error('Error fetching project products:', err);
        setProjectProducts([]);
      }
    },
    [projectId],
  );

  useEffect(() => {
    fetchProject();
    fetchProjectProducts();
  }, [fetchProject, fetchProjectProducts]);

  const projectItems = useMemo<ProjectItem[]>(() => {
    // First try to use products from the API, then fall back to project.items
    if (projectProducts.length > 0) {
      return projectProducts.map(normalizeItem);
    }
    if (project?.items && Array.isArray(project.items)) {
      return project.items.map(normalizeItem);
    }
    return [];
  }, [projectProducts, project?.items, normalizeItem]);

  const projectTitle =
    project?.name ?? project?.title ?? fallbackTitle ?? 'Project Detail';

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title={projectTitle} />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              fetchProject('refresh');
              fetchProjectProducts('refresh');
            }}
            tintColor={COLORS.primary}
          />
        }
      >
        {error ? (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={() => fetchProject()}
          >
            <MaterialIcon
              name="error-outline"
              size={20}
              color={COLORS.accentRed}
            />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        {loading && !project ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading project details...</Text>
          </View>
        ) : null}

        {project ? (
          <View style={styles.metaCard}>
            <Text style={styles.metaTitle}>{projectTitle}</Text>
            {project?.status ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>
                  {project?.status_display ?? project.status}
                </Text>
              </View>
            ) : null}
            {project?.site_name || project?.site ? (
              <Text style={styles.metaLine}>
                Site: {project?.site_name ?? project?.site}
              </Text>
            ) : null}
            {project?.created_at ? (
              <Text style={styles.metaLine}>
                Created:{' '}
                {new Date(project.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            ) : null}
            {project?.description ? (
              <Text style={styles.metaDescription}>{project.description}</Text>
            ) : null}
          </View>
        ) : null}

        {projectItems.length === 0 && !loading && !error ? (
          <View style={styles.emptyState}>
            <Icon name="cube-outline" size={36} color={COLORS.gray700} />
            <Text style={styles.emptyTitle}>No items yet</Text>
            <Text style={styles.emptySubtitle}>
              Items assigned to this project will appear here.
            </Text>
          </View>
        ) : null}

        {projectItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemContainer}
            onPress={() => {
              navigation.navigate('ProductDetail', {
                productId: item.id,
              });
            }}
          >
            <View style={styles.itemContent}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : (
                <MaterialIcons
                  name="image"
                  size={s(40)}
                  color={COLORS.primary}
                />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.name}>{item.name}</Text>
                {item.quantity != null ? (
                  <Text style={styles.metaSmall}>
                    Quantity: {Number(item.quantity)}
                  </Text>
                ) : null}
                {item.status ? (
                  <Text style={styles.metaSmall}>Status: {item.status}</Text>
                ) : null}
              </View>
            </View>
            <Icon
              name="chevron-forward"
              size={20}
              color={COLORS.textSemiDark}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyProjectDetail;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray975,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: '16@vs',
    paddingHorizontal: '16@s',
    paddingBottom: '40@vs',
  },
  metaCard: {
    backgroundColor: COLORS.white,
    borderRadius: '10@s',
    padding: '14@s',
    marginBottom: '16@vs',
  },
  metaTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: '6@vs',
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.infoSurface,
    paddingHorizontal: '10@s',
    paddingVertical: '4@vs',
    borderRadius: '20@s',
    marginBottom: '8@vs',
  },
  statusText: {
    fontSize: '11@ms',
    fontWeight: '600',
    color: COLORS.primary,
  },
  metaLine: {
    fontSize: '12@ms',
    color: COLORS.textSemiDark,
    marginBottom: '4@vs',
  },
  metaDescription: {
    fontSize: '12@ms',
    color: COLORS.textDark,
    marginTop: '6@vs',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: '12@s',
    paddingVertical: '10@vs',
    borderRadius: '10@s',
    marginBottom: '12@vs',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@s',
    flex: 1,
    marginRight: '10@s',
  },
  image: {
    width: '70@s',
    height: '50@vs',
    borderRadius: '8@s',
    backgroundColor: COLORS.gray925,
  },
  itemInfo: {
    flex: 1,
  },
  name: {
    color: COLORS.black,
    fontSize: '13@ms',
    fontWeight: '600',
    marginBottom: '2@vs',
  },
  metaSmall: {
    fontSize: '11@ms',
    color: COLORS.textAsh,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '40@vs',
    gap: '8@vs',
  },
  emptyTitle: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: COLORS.textSemiDark,
  },
  emptySubtitle: {
    fontSize: '12@ms',
    color: COLORS.textAsh,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    gap: '8@s',
    marginBottom: '12@vs',
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
    paddingVertical: '20@vs',
  },
  loaderText: {
    fontSize: '12@ms',
    color: COLORS.textDark,
  },
});
