import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { s, ScaledSheet } from 'react-native-size-matters';
import Header from './Header';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import COLORS from '../constants/colors';
import { getCategories } from '../api/categories';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type RootStackParamList = {
  ProductCategoryList: { category: CategoryItem };
  Categories: undefined;
};

interface CategoryItem {
  id: string;
  name: string;
  imageUrl: string | null;
}

const Categories = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeCategory = useCallback((item: any, index: number) => {
    return {
      id: String(
        item?.id ?? item?.category_id ?? item?.uuid ?? `category-${index}`,
      ),
      name: item?.name ?? item?.title ?? 'Category',
      imageUrl: item?.logo ?? null,
    };
  }, []);

  const fetchCategories = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const payload = await getCategories({ page_size: 20 });
        const listSource = Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setCategories(listSource.map(normalizeCategory));
      } catch (err: any) {
        setError(err?.message || 'Unable to load categories.');
        setCategories([]);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [normalizeCategory],
  );

  const handleRefresh = useCallback(() => {
    fetchCategories(true);
  }, [fetchCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const renderCategoryItem = useCallback(
    ({ item }: { item: CategoryItem }) => (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() =>
          navigation.navigate('ProductCategoryList', { category: item })
        }
      >
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.categoryImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imageContainer}>
              <MaterialIcons
                name="category"
                size={s(40)}
                color={COLORS.primary}
              />
            </View>
          )}
        </View>
        <Text
          style={styles.categoryName}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    ),
    [navigation],
  );

  const renderListHeader = useCallback(() => {
    if (!error) {
      return null;
    }
    return (
      <TouchableOpacity
        style={styles.errorBanner}
        onPress={() => fetchCategories(false)}
      >
        <Icon name="warning-outline" size={18} color={COLORS.accentRed} />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText}>Tap to retry</Text>
      </TouchableOpacity>
    );
  }, [error, fetchCategories]);

  const renderListEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading categories...</Text>
        </View>
      );
    }
    if (!error) {
      return (
        <View style={styles.emptyState}>
          <Icon name="apps-outline" size={32} color={COLORS.gray500} />
          <Text style={styles.emptyTitle}>No categories available</Text>
          <Text style={styles.emptySubtitle}>Please try again later.</Text>
        </View>
      );
    }
    return null;
  }, [error, loading]);

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={renderCategoryItem}
        numColumns={5}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
      />
    </View>
  );
};

export default Categories;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray975,
  },
  listContent: {
    paddingHorizontal: '16@s',
    paddingBottom: '20@vs',
    paddingTop: '10@vs',
  },
  header: {
    fontSize: '24@ms',
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: '20@vs',
    marginBottom: '24@vs',
    textAlign: 'center',
  },
  columnWrapper: {
    // justifyContent: 'space-between',
  },
  categoryItem: {
    maxWidth: '65@s', // 4 items per row (100% / 4 - some margin)
    alignItems: 'center',
    marginBottom: '20@vs',
    padding: '5@s',
  },
  imageContainer: {
    width: '50@s',
    height: '50@s',
    borderRadius: '60@s', // Makes it circular
    backgroundColor: COLORS.gray950,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: '4@vs',
    // shadowColor: COLORS.black,
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    // elevation: 3,
    // overflow: 'hidden',
    // Ensures image stays within rounded bounds
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: '30@s',
  },
  categoryName: {
    fontSize: '12@ms',
    fontWeight: '500',
    color: COLORS.textSemiDark,
    textAlign: 'center',
    marginTop: '2@vs',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    marginTop: '10@vs',
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
    paddingVertical: '20@vs',
  },
  loaderText: {
    fontSize: '13@ms',
    color: COLORS.textDark,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: '20@vs',
  },
  emptyTitle: {
    marginTop: '8@vs',
    fontSize: '14@ms',
    fontWeight: '600',
    color: COLORS.textDark,
  },
  emptySubtitle: {
    fontSize: '12@ms',
    color: COLORS.gray500,
  },
});
