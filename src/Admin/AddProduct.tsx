import Icon from '@expo/vector-icons/FontAwesome6';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AxiosError, AxiosResponse } from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as mimeType from 'react-native-mime-types';

import InfoBox from '@/components/InfoBox';
import api from '@/services/api';
import type { AppStackParamList } from '@/types/navigation';
import log from '@/utils/log';
import { getAuthToken } from '@/utils/storage';
import { showToast } from '@/utils/toast';
import { useTheme } from '../context/themeContext';

type ColorEntry = {
  color: string;
  displayName: string;
};

type SizeEntry = {
  size: string;
  displayName: string;
};

type ProductFormData = {
  title: string;
  price: string;
  stock: string;
  category: string;
  image: string;
  description: string;
  colors: ColorEntry[];
  sizes: SizeEntry[];
  detailsBrand: string;
  detailsMaterial: string;
  detailsCondition: string;
  detailsColors: string;
  detailsSizes: string;
  gender: string;
  subCategory: string;
  subCategoryChild: string;
  isDealActive: boolean;
  discountPrice: string;
};

type CreateProductResponse =
  | {
      success: true;
      message: string;
      product?: unknown;
    }
  | {
      success: false;
      message: string;
    };

type UploadImageResponse = ({
      success: true;
      message: string;
      imageUrl: string;
      imageName: string;
    })
  | ({
      success: false;
      message: string;
    });

type EntryErrors = {
  color?: string;
  size?: string;
  displayName?: string;
};

const AddProductScreen: React.FC = () => {
  const { currentTextColor, currentBgColor, themeColor } = useTheme();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    price: '',
    stock: '',
    category: '',
    image: '',
    description: '',
    colors: [],
    sizes: [],
    detailsBrand: '',
    detailsMaterial: '',
    detailsCondition: '',
    detailsColors: '',
    detailsSizes: '',
    gender: '',
    subCategory: '',
    subCategoryChild: '',
    isDealActive: false,
    discountPrice: '',
  });
  const [regLoading, setRegLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [alertIcon, setAlertIcon] = useState<string | null>(null);
  const [alertColor, setAlertColor] = useState<string | null>(null);
  const [isInfoVisible, setIsInfoVisible] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<ProductFormData>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [newColor, setNewColor] = useState<ColorEntry>({
    color: '',
    displayName: '',
  });
  const [newSize, setNewSize] = useState<SizeEntry>({
    size: '',
    displayName: '',
  });
  const [colorErrors, setColorErrors] = useState<EntryErrors>({});
  const [sizeErrors, setSizeErrors] = useState<EntryErrors>({});
  const [_, setImageUri] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // Validation regex
  const numberRegex = /^\d+(\.\d{1,2})?$/;

  const showInfo = (): void => {
    setIsInfoVisible(true);
    setTimeout(() => {
      setIsInfoVisible(false);
    }, 1500);
  };

  const setErrorMessage = (msg: string, icon: string, color: string): void => {
    setMessage(msg);
    setAlertIcon(icon);
    setAlertColor(color);
    showInfo();
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    const { status, canAskAgain } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === ImagePicker.PermissionStatus.GRANTED) {
      return true;
    }
    if (status === ImagePicker.PermissionStatus.DENIED && !canAskAgain) {
      setErrorMessage(
        'Gallery access was denied. Please enable it in Settings.',
        'exclamation',
        '#e6b800',
      );
      setTimeout(async () => {
        await Linking.openSettings();
      }, 2000);
      return false;
    }
    setErrorMessage(
      'Permission to access gallery was denied',
      'exclamation',
      '#e6b800',
    );
    return false;
  };

  const pickImage = async (): Promise<void> => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
        setImageUploadError(null);
        await uploadImage(result.assets[0].uri);
      } else {
        setErrorMessage('No image was selected', 'info', '#0055b8');
      }
    } catch (error) {
      log.debug('Image Picker Error: ', error);
      setErrorMessage('Failed to pick image', 'xmark', '#660202');
    }
  };

  const uploadImage = async (uri: string): Promise<void> => {
    try {
      const formData = new FormData();
      // find image type and extension can we some library
      // or we can use a library like mime to get the type
      const type = mimeType.lookup(uri);
      if (!type) {
        throw new Error('Unable to determine image type');
      }
      
      const ext = mimeType.extension(type);
      if (!ext) {
        throw new Error('Unable to determine image extension');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      formData.append('image', {
        uri,
        name: `image.${ext}`,
        type,
      } as any);

      const response = await api.public.post<
        FormData,
        AxiosResponse<UploadImageResponse>
      >('/v1/product/upload', formData, {
        headers: {
          Authorization: `Bearer ${await getAuthToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      setFormData((prev) => ({ ...prev, image: response.data.success ? response.data.imageName: '' }));
      setImageUploadError(null);
    } catch (error) {
      log.debug('Image Upload Error: ', error);
      if (error instanceof AxiosError && error.response) {
        const response = error.response.data as Extract<
          UploadImageResponse,
          { success: false }
        >;
        console.log(response);
        setImageUploadError(response.message || 'Failed to upload image');
      } else if (error instanceof Error) {
        setImageUploadError(error.message);
      } else {
        setImageUploadError('Unknown error during image upload');
      }
      setErrorMessage('Failed to upload image', 'xmark', '#660202');
    }
  };

  const validateFields = (): boolean => {
    const errors: Partial<ProductFormData> = {};
    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }
    if (!formData.price || !numberRegex.test(formData.price)) {
      errors.price = 'Valid price is required (e.g., 29.99)';
      isValid = false;
    }
    if (!formData.stock || !/^\d+$/.test(formData.stock)) {
      errors.stock = 'Valid stock quantity is required';
      isValid = false;
    }
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
      isValid = false;
    }
    if (!formData.image.trim()) {
      errors.image = 'Image is required';
      isValid = false;
    }
    if (formData.discountPrice && !numberRegex.test(formData.discountPrice)) {
      errors.discountPrice = 'Valid discount price is required (e.g., 19.99)';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const validateNewColor = (): boolean => {
    const errors: EntryErrors = {};
    let isValid = true;

    if (!newColor.color.trim()) {
      errors.color = 'Color is required';
      isValid = false;
    }
    if (!newColor.displayName.trim()) {
      errors.displayName = 'Display name is required';
      isValid = false;
    }

    setColorErrors(errors);
    return isValid;
  };

  const validateNewSize = (): boolean => {
    const errors: EntryErrors = {};
    let isValid = true;

    if (!newSize.size.trim()) {
      errors.size = 'Size is required';
      isValid = false;
    }
    if (!newSize.displayName.trim()) {
      errors.displayName = 'Display name is required';
      isValid = false;
    }

    setSizeErrors(errors);
    return isValid;
  };

  const handleInputChange = (
    field: keyof ProductFormData,
    value: string | boolean,
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNewColorChange = (
    field: keyof ColorEntry,
    value: string,
  ): void => {
    setNewColor((prev) => ({ ...prev, [field]: value }));
    if (colorErrors[field]) {
      setColorErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNewSizeChange = (field: keyof SizeEntry, value: string): void => {
    setNewSize((prev) => ({ ...prev, [field]: value }));
    if (sizeErrors[field]) {
      setSizeErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const addColor = (): void => {
    if (!validateNewColor()) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        {
          color: newColor.color.trim(),
          displayName: newColor.displayName.trim(),
        },
      ],
    }));
    setNewColor({ color: '', displayName: '' });
  };

  const removeColor = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const addSize = (): void => {
    if (!validateNewSize()) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      sizes: [
        ...prev.sizes,
        { size: newSize.size.trim(), displayName: newSize.displayName.trim() },
      ],
    }));
    setNewSize({ size: '', displayName: '' });
  };

  const removeSize = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const handleCreateProduct = async (): Promise<void> => {
    setRegLoading(true);
    setFieldErrors({});

    try {
      if (!validateFields()) {
        setRegLoading(false);
        setErrorMessage(
          'Please fill all required fields correctly',
          'exclamation',
          '#e6b800',
        );
        return;
      }

      const payload: Record<string, unknown> = {
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        category: formData.category.trim(),
        image: formData.image.trim(),
        description: formData.description.trim() || undefined,
        colors: formData.colors.length > 0 ? formData.colors : undefined,
        sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
        subCategory: formData.subCategory.trim() || undefined,
        subCategoryChild: formData.subCategoryChild.trim() || undefined,
        isDealActive: formData.isDealActive,
        discountPrice: formData.discountPrice
          ? parseFloat(formData.discountPrice)
          : undefined,
      };

      if (
        formData.detailsBrand ||
        formData.detailsMaterial ||
        formData.detailsCondition ||
        formData.detailsColors ||
        formData.detailsSizes
      ) {
        payload.details = {
          brand: formData.detailsBrand.trim() || undefined,
          material: formData.detailsMaterial.trim() || undefined,
          condition: formData.detailsCondition.trim() || undefined,
          colors: formData.detailsColors.trim() || undefined,
          sizes: formData.detailsSizes.trim() || undefined,
        };
      }

      if (formData.gender) {
        payload.gender = formData.gender
          .split(',')
          .map((g) => g.trim())
          .filter((g) => g);
      }

      const response = await api.public.post<
        ProductFormData,
        AxiosResponse<CreateProductResponse>
      >('/v1/product', payload, {
        headers: {
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      setErrorMessage('Product created successfully', 'check', '#003609');
      setFormData({
        title: '',
        price: '',
        stock: '',
        category: '',
        image: '',
        description: '',
        colors: [],
        sizes: [],
        detailsBrand: '',
        detailsMaterial: '',
        detailsCondition: '',
        detailsColors: '',
        detailsSizes: '',
        gender: '',
        subCategory: '',
        subCategoryChild: '',
        isDealActive: false,
        discountPrice: '',
      });
      setNewColor({ color: '', displayName: '' });
      setNewSize({ size: '', displayName: '' });
      setImageUri(null);
      setImageUploadError(null);

      setTimeout(() => {
        navigation.navigate('orderScreenForAdmin');
      }, 500);
    } catch (error) {
      log.debug('Create Product Error: ', error);
      if (error instanceof AxiosError && error.response) {
        const response = error.response.data as Extract<
          CreateProductResponse,
          { success: false }
        >;
        if (error.response.status === 400) {
          setErrorMessage(
            response.message || 'Invalid input data',
            'xmark',
            '#660202',
          );
        } else if (
          error.response.status === 401 ||
          error.response.status === 403
        ) {
          setErrorMessage(
            'Unauthorized access. Please log in again.',
            'xmark',
            '#660202',
          );
          setTimeout(() => navigation.navigate('login'), 1500);
        } else if (error.response.status === 500) {
          showToast({ type: 'error', message: 'Server error' });
          setErrorMessage('Server error', 'circle-exclamation', '#362600');
        }
      } else if (error instanceof Error) {
        setErrorMessage(error.message, 'exclamation', '#e6b800');
      }
    } finally {
      setRegLoading(false);
    }
  };

  const styles = StyleSheet.create({
    addBtn: {
      alignItems: 'center',
      backgroundColor: themeColor,
      borderRadius: 10,
      height: 50,
      justifyContent: 'center',
      paddingHorizontal: 15,
    },
    addContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
      marginVertical: 10,
    },
    addInput: {
      borderColor: currentTextColor,
      borderRadius: 10,
      borderWidth: 1.5,
      color: currentTextColor,
      flex: 1,
      fontSize: 17,
      height: 50,
      padding: 12,
    },
    container: {
      backgroundColor: currentBgColor,
      flex: 1,
      paddingHorizontal: 15,
    },
    createBtn: {
      alignItems: 'center',
      backgroundColor: themeColor,
      borderRadius: 10,
      height: 50,
      justifyContent: 'center',
      marginTop: 10,
    },
    errorText: {
      color: 'red',
      fontSize: 16,
      marginBottom: 5,
    },
    imagePickerBtn: {
      alignItems: 'center',
      borderColor: currentTextColor,
      borderRadius: 10,
      borderWidth: 1.5,
      height: 50,
      justifyContent: 'center',
      marginVertical: 5,
    },
    imagePickerText: {
      color: currentTextColor,
      fontSize: 17,
    },
    listItem: {
      alignItems: 'center',
      borderBottomColor: currentTextColor,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
    },
    listItemText: {
      color: currentTextColor,
      flex: 1,
      fontSize: 16,
    },
    removeBtn: {
      padding: 5,
    },
    sectionHeader: {
      color: currentTextColor,
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 5,
      marginTop: 15,
    },
    switchContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 10,
    },
    textInput: {
      borderColor: currentTextColor,
      borderRadius: 10,
      borderWidth: 1.5,
      color: currentTextColor,
      fontSize: 17,
      height: 50,
      marginVertical: 5,
      padding: 12,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 15,
          gap: 10,
        }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#222" />
        </Pressable>
        <Text style={{ color: '#222', fontSize: 24, fontWeight: '500' }}>
          Add New Product
        </Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 20 }}>
          <View style={{ gap: 10 }}>
            {/* Basic Info */}
            <Text style={styles.sectionHeader}>Basic Information</Text>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: fieldErrors.title
                      ? 'red'
                      : focusedField === 'title'
                        ? 'blue'
                        : currentTextColor,
                  },
                ]}
                placeholder="Product Title"
                placeholderTextColor={currentTextColor}
                value={formData.title}
                onChangeText={(text) => handleInputChange('title', text)}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
              />
              {fieldErrors.title && (
                <Text style={styles.errorText}>{fieldErrors.title}</Text>
              )}
            </View>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: fieldErrors.price
                      ? 'red'
                      : focusedField === 'price'
                        ? 'blue'
                        : currentTextColor,
                  },
                ]}
                placeholder="Price (e.g., 29.99)"
                placeholderTextColor={currentTextColor}
                value={formData.price}
                onChangeText={(text) => handleInputChange('price', text)}
                keyboardType="numeric"
                onFocus={() => setFocusedField('price')}
                onBlur={() => setFocusedField(null)}
              />
              {fieldErrors.price && (
                <Text style={styles.errorText}>{fieldErrors.price}</Text>
              )}
            </View>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: fieldErrors.stock
                      ? 'red'
                      : focusedField === 'stock'
                        ? 'blue'
                        : currentTextColor,
                  },
                ]}
                placeholder="Stock Quantity"
                placeholderTextColor={currentTextColor}
                value={formData.stock}
                onChangeText={(text) => handleInputChange('stock', text)}
                keyboardType="numeric"
                onFocus={() => setFocusedField('stock')}
                onBlur={() => setFocusedField(null)}
              />
              {fieldErrors.stock && (
                <Text style={styles.errorText}>{fieldErrors.stock}</Text>
              )}
            </View>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: fieldErrors.category
                      ? 'red'
                      : focusedField === 'category'
                        ? 'blue'
                        : currentTextColor,
                  },
                ]}
                placeholder="Category (e.g., Clothing)"
                placeholderTextColor={currentTextColor}
                value={formData.category}
                onChangeText={(text) => handleInputChange('category', text)}
                onFocus={() => setFocusedField('category')}
                onBlur={() => setFocusedField(null)}
              />
              {fieldErrors.category && (
                <Text style={styles.errorText}>{fieldErrors.category}</Text>
              )}
            </View>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor:
                      focusedField === 'subCategory'
                        ? 'blue'
                        : currentTextColor,
                  },
                ]}
                placeholder="Subcategory (e.g., Shirts)"
                placeholderTextColor={currentTextColor}
                value={formData.subCategory}
                onChangeText={(text) => handleInputChange('subCategory', text)}
                onFocus={() => setFocusedField('subCategory')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor:
                      focusedField === 'subCategoryChild'
                        ? 'blue'
                        : currentTextColor,
                  },
                ]}
                placeholder="Subcategory Child (e.g., Casual Shirts)"
                placeholderTextColor={currentTextColor}
                value={formData.subCategoryChild}
                onChangeText={(text) =>
                  handleInputChange('subCategoryChild', text)
                }
                onFocus={() => setFocusedField('subCategoryChild')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View>
              <TouchableOpacity
                style={[
                  styles.imagePickerBtn,
                  {
                    borderColor: fieldErrors.image
                      ? 'red'
                      : focusedField === 'image'
                        ? 'blue'
                        : currentTextColor,
                  },
                ]}
                onPress={pickImage}
                onFocus={() => setFocusedField('image')}
                onBlur={() => setFocusedField(null)}
              >
                <Text style={styles.imagePickerText}>
                  {formData.image
                    ? `Selected: ${formData.image}`
                    : 'Pick an Image'}
                </Text>
              </TouchableOpacity>
              {fieldErrors.image && (
                <Text style={styles.errorText}>{fieldErrors.image}</Text>
              )}
              {imageUploadError && (
                <Text style={styles.errorText}>{imageUploadError}</Text>
              )}
            </View>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor:
                      focusedField === 'description'
                        ? 'blue'
                        : currentTextColor,
                    height: 100,
                    textAlignVertical: 'top',
                  },
                ]}
                placeholder="Description"
                placeholderTextColor={currentTextColor}
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                multiline
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Colors and Sizes */}
            <Text style={styles.sectionHeader}>Colors and Sizes</Text>
            {/* Colors List */}
            <View>
              <Text style={[styles.sectionHeader, { fontSize: 16 }]}>
                Colors
              </Text>
              {formData.colors.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>
                    {item.color} ({item.displayName})
                  </Text>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeColor(index)}
                  >
                    <Icon name="trash" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.addContainer}>
                <TextInput
                  style={[
                    styles.addInput,
                    {
                      borderColor: colorErrors.color
                        ? 'red'
                        : focusedField === 'newColor'
                          ? 'blue'
                          : currentTextColor,
                    },
                  ]}
                  placeholder="Color (e.g., Red)"
                  placeholderTextColor={currentTextColor}
                  value={newColor.color}
                  onChangeText={(text) => handleNewColorChange('color', text)}
                  onFocus={() => setFocusedField('newColor')}
                  onBlur={() => setFocusedField(null)}
                />
                <TextInput
                  style={[
                    styles.addInput,
                    {
                      borderColor: colorErrors.displayName
                        ? 'red'
                        : focusedField === 'newColorDisplayName'
                          ? 'blue'
                          : currentTextColor,
                    },
                  ]}
                  placeholder="Display Name (e.g., Red)"
                  placeholderTextColor={currentTextColor}
                  value={newColor.displayName}
                  onChangeText={(text) =>
                    handleNewColorChange('displayName', text)
                  }
                  onFocus={() => setFocusedField('newColorDisplayName')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity style={styles.addBtn} onPress={addColor}>
                  <Text style={{ color: '#fff', fontSize: 16 }}>Add</Text>
                </TouchableOpacity>
              </View>
              {colorErrors.color && (
                <Text style={styles.errorText}>{colorErrors.color}</Text>
              )}
              {colorErrors.displayName && (
                <Text style={styles.errorText}>{colorErrors.displayName}</Text>
              )}
            </View>
            {/* Sizes List */}
            <View>
              <Text style={[styles.sectionHeader, { fontSize: 16 }]}>
                Sizes
              </Text>
              {formData.sizes.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>
                    {item.size} ({item.displayName})
                  </Text>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeSize(index)}
                  >
                    <Icon name="trash" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.addContainer}>
                <TextInput
                  style={[
                    styles.addInput,
                    {
                      borderColor: sizeErrors.size
                        ? 'red'
                        : focusedField === 'newSize'
                          ? 'blue'
                          : currentTextColor,
                    },
                  ]}
                  placeholder="Size (e.g., M)"
                  placeholderTextColor={currentTextColor}
                  value={newSize.size}
                  onChangeText={(text) => handleNewSizeChange('size', text)}
                  onFocus={() => setFocusedField('newSize')}
                  onBlur={() => setFocusedField(null)}
                />
                <TextInput
                  style={[
                    styles.addInput,
                    {
                      borderColor: sizeErrors.displayName
                        ? 'red'
                        : focusedField === 'newSizeDisplayName'
                          ? 'blue'
                          : currentTextColor,
                    },
                  ]}
                  placeholder="Display Name (e.g., Medium)"
                  placeholderTextColor={currentTextColor}
                  value={newSize.displayName}
                  onChangeText={(text) =>
                    handleNewSizeChange('displayName', text)
                  }
                  onFocus={() => setFocusedField('newSizeDisplayName')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity style={styles.addBtn} onPress={addSize}>
                  <Text style={{ color: '#fff', fontSize: 16 }}>Add</Text>
                </TouchableOpacity>
              </View>
              {sizeErrors.size && (
                <Text style={styles.errorText}>{sizeErrors.size}</Text>
              )}
              {sizeErrors.displayName && (
                <Text style={styles.errorText}>{sizeErrors.displayName}</Text>
              )}
            </View>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor:
                      focusedField === 'gender' ? 'blue' : currentTextColor,
                  },
                ]}
                placeholder="Gender (e.g., Men,Women)"
                placeholderTextColor={currentTextColor}
                value={formData.gender}
                onChangeText={(text) => handleInputChange('gender', text)}
                onFocus={() => setFocusedField('gender')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Details */}
            <Text style={styles.sectionHeader}>Product Details</Text>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor:
                      focusedField === 'detailsBrand'
                        ? 'blue'
                        : currentTextColor,
                  },
                ]}
                placeholder="Brand"
                placeholderTextColor={currentTextColor}
                value={formData.detailsBrand}
                onChangeText={(text) => handleInputChange('detailsBrand', text)}
                onFocus={() => setFocusedField('detailsBrand')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor:
                      focusedField === 'detailsMaterial'
                        ? 'blue'
                        : currentTextColor,
                  },
                ]}
                placeholder="Material"
                placeholderTextColor={currentTextColor}
                value={formData.detailsMaterial}
                onChangeText={(text) =>
                  handleInputChange('detailsMaterial', text)
                }
                onFocus={() => setFocusedField('detailsMaterial')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor:
                      focusedField === 'detailsCondition'
                        ? 'blue'
                        : currentTextColor,
                  },
                ]}
                placeholder="Condition (e.g., New)"
                placeholderTextColor={currentTextColor}
                value={formData.detailsCondition}
                onChangeText={(text) =>
                  handleInputChange('detailsCondition', text)
                }
                onFocus={() => setFocusedField('detailsCondition')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor:
                      focusedField === 'detailsColors'
                        ? 'blue'
                        : currentTextColor,
                  },
                ]}
                placeholder="Colors Description"
                placeholderTextColor={currentTextColor}
                value={formData.detailsColors}
                onChangeText={(text) =>
                  handleInputChange('detailsColors', text)
                }
                onFocus={() => setFocusedField('detailsColors')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor:
                      focusedField === 'detailsSizes'
                        ? 'blue'
                        : currentTextColor,
                  },
                ]}
                placeholder="Sizes Description"
                placeholderTextColor={currentTextColor}
                value={formData.detailsSizes}
                onChangeText={(text) => handleInputChange('detailsSizes', text)}
                onFocus={() => setFocusedField('detailsSizes')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Deal and Pricing */}
            <Text style={styles.sectionHeader}>Deal and Pricing</Text>
            <View style={styles.switchContainer}>
              <Text style={{ color: currentTextColor, fontSize: 16 }}>
                Deal Active
              </Text>
              <Switch
                value={formData.isDealActive}
                onValueChange={(value) =>
                  handleInputChange('isDealActive', value)
                }
                trackColor={{ false: '#767577', true: themeColor }}
                thumbColor={formData.isDealActive ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: fieldErrors.discountPrice
                      ? 'red'
                      : focusedField === 'discountPrice'
                        ? 'blue'
                        : currentTextColor,
                  },
                ]}
                placeholder="Discount Price (e.g., 19.99)"
                placeholderTextColor={currentTextColor}
                value={formData.discountPrice}
                onChangeText={(text) =>
                  handleInputChange('discountPrice', text)
                }
                keyboardType="numeric"
                onFocus={() => setFocusedField('discountPrice')}
                onBlur={() => setFocusedField(null)}
              />
              {fieldErrors.discountPrice && (
                <Text style={styles.errorText}>
                  {fieldErrors.discountPrice}
                </Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.createBtn, { opacity: regLoading ? 0.7 : 1 }]}
              onPress={handleCreateProduct}
              disabled={regLoading}
            >
              {regLoading ? (
                <ActivityIndicator size={30} color="#fff" />
              ) : (
                <Text
                  style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}
                >
                  CREATE PRODUCT
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {isInfoVisible && alertIcon && alertColor && (
        <InfoBox message={message} iconName={alertIcon} bgColor={alertColor} />
      )}
    </SafeAreaView>
  );
};

export default AddProductScreen;
