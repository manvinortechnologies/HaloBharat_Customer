import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { s } from 'react-native-size-matters';
import COLORS from '../constants/colors';

const { width: screenWidth } = Dimensions.get('window');

export interface CarouselItem {
  imageUrl?: string | null;
  title?: string | null;
  type?: string | null;
  [key: string]: any;
}

interface SimpleCarouselProps {
  data: CarouselItem[];
  autoPlayInterval?: number;
  height?: number | string;
  showIndicators?: boolean;
  onItemPress?: (item: CarouselItem, index: number) => void;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  containerStyle?: any;
  imageStyle?: any;
}

const SimpleCarousel: React.FC<SimpleCarouselProps> = ({
  data,
  autoPlayInterval = 3000,
  height = '180@vs',
  showIndicators = true,
  onItemPress,
  resizeMode = 'cover',
  containerStyle,
  imageStyle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (data.length <= 1) {
      setCurrentIndex(0);
      return;
    }

    const timer = setInterval(() => {
      const nextIndex = currentIndex === data.length - 1 ? 0 : currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [currentIndex, data.length, autoPlayInterval]);

  if (data.length === 0) {
    return null;
  }

  const handleScroll = (event: any) => {
    const newIndex = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth,
    );
    setCurrentIndex(newIndex);
  };

  const handleItemPress = (item: CarouselItem, index: number) => {
    if (onItemPress) {
      onItemPress(item, index);
    }
  };

  return (
    <View style={[styles.carouselContainer, containerStyle]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {data.map((item, index) => {
          const content = (
            <View
              key={index}
              style={[styles.bannerWrapper, { width: screenWidth }]}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={[
                    styles.bannerImage,
                    typeof height === 'number' ? { height } : {},
                    imageStyle,
                  ]}
                  resizeMode={resizeMode}
                />
              ) : (
                <View
                  style={[
                    styles.placeholderContainer,
                    typeof height === 'number' ? { height } : {},
                  ]}
                >
                  <MaterialIcons
                    name="image"
                    size={s(40)}
                    color={COLORS.primary}
                  />
                </View>
              )}
            </View>
          );

          return onItemPress ? (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={() => handleItemPress(item, index)}
            >
              {content}
            </TouchableOpacity>
          ) : (
            content
          );
        })}
      </ScrollView>

      {showIndicators && data.length > 1 && (
        <View style={styles.indicatorContainer}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default SimpleCarousel;

const styles = ScaledSheet.create({
  carouselContainer: {
    position: 'relative',
    marginVertical: '10@vs',
  },
  bannerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: screenWidth - 20,
    height: '160@vs',
    borderRadius: '10@s',
  },
  placeholderContainer: {
    width: screenWidth - 20,
    height: '180@vs',
    borderRadius: '10@s',
    backgroundColor: COLORS.gray975,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '8@vs',
    width: '100%',
  },
  indicator: {
    width: '6@s',
    height: '6@s',
    borderRadius: '3@s',
    backgroundColor: COLORS.gray700,
    marginHorizontal: '3@s',
  },
  activeIndicator: {
    backgroundColor: COLORS.black,
  },
});
