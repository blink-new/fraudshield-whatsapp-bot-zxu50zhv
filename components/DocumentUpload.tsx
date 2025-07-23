import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface DocumentUploadProps {
  onDocumentProcessed: (result: any) => void;
  documentType?: 'PO' | 'RFQ' | 'PoP' | 'EFT';
  placeholder?: string;
}

export default function DocumentUpload({ 
  onDocumentProcessed, 
  documentType,
  placeholder = "Upload document or take photo"
}: DocumentUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        await processDocument(result.assets[0].uri, result.assets[0].name);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleCameraCapture = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to capture documents');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processDocument(result.assets[0].uri, 'camera_capture.jpg');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleGalleryPick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Gallery permission is needed to select images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processDocument(result.assets[0].uri, 'gallery_image.jpg');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const processDocument = async (uri: string, filename: string) => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Import the DocumentValidationAPI
      const DocumentValidationAPI = (await import('../services/DocumentValidationAPI')).default;
      
      // Process document with ML/OCR
      const validationResult = await DocumentValidationAPI.validateDocument(uri, documentType);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Simulate final processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onDocumentProcessed({
        ...validationResult,
        filename,
        uri,
      });

    } catch (error) {
      Alert.alert('Processing Error', 'Failed to process document. Please try again.');
      console.error('Document processing error:', error);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const showUploadOptions = () => {
    Alert.alert(
      'Upload Document',
      'Choose how you want to upload your document',
      [
        { text: 'Take Photo', onPress: handleCameraCapture },
        { text: 'Choose from Gallery', onPress: handleGalleryPick },
        { text: 'Browse Files', onPress: handleDocumentPick },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (isProcessing) {
    return (
      <View className="bg-white rounded-lg p-4 mx-4 my-2 border border-gray-200">
        <View className="items-center">
          <ActivityIndicator size="large" color="#25D366" />
          <Text className="text-gray-600 mt-2 font-medium">Processing Document...</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Running ML analysis and registry validation
          </Text>
          
          {/* Progress Bar */}
          <View className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <View 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </View>
          <Text className="text-xs text-gray-500 mt-1">{uploadProgress}%</Text>
          
          {/* Processing Steps */}
          <View className="mt-4 w-full">
            <View className="flex-row items-center mb-2">
              <Ionicons 
                name={uploadProgress > 20 ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={uploadProgress > 20 ? "#22c55e" : "#9ca3af"} 
              />
              <Text className={`ml-2 text-sm ${uploadProgress > 20 ? 'text-green-600' : 'text-gray-500'}`}>
                OCR Text Extraction
              </Text>
            </View>
            
            <View className="flex-row items-center mb-2">
              <Ionicons 
                name={uploadProgress > 50 ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={uploadProgress > 50 ? "#22c55e" : "#9ca3af"} 
              />
              <Text className={`ml-2 text-sm ${uploadProgress > 50 ? 'text-green-600' : 'text-gray-500'}`}>
                ML Data Extraction
              </Text>
            </View>
            
            <View className="flex-row items-center mb-2">
              <Ionicons 
                name={uploadProgress > 80 ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={uploadProgress > 80 ? "#22c55e" : "#9ca3af"} 
              />
              <Text className={`ml-2 text-sm ${uploadProgress > 80 ? 'text-green-600' : 'text-gray-500'}`}>
                Registry Validation
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons 
                name={uploadProgress === 100 ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={uploadProgress === 100 ? "#22c55e" : "#9ca3af"} 
              />
              <Text className={`ml-2 text-sm ${uploadProgress === 100 ? 'text-green-600' : 'text-gray-500'}`}>
                Risk Assessment
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={showUploadOptions}
      className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mx-4 my-2 items-center"
      activeOpacity={0.7}
    >
      <Ionicons name="cloud-upload-outline" size={32} color="#9ca3af" />
      <Text className="text-gray-600 font-medium mt-2">{placeholder}</Text>
      <Text className="text-sm text-gray-500 mt-1 text-center">
        Supports PDF, images, and text files
      </Text>
      <Text className="text-xs text-gray-400 mt-2 text-center">
        ML-powered OCR • Registry validation • Fraud detection
      </Text>
      
      <View className="flex-row mt-3 space-x-4">
        <View className="items-center">
          <Ionicons name="camera-outline" size={20} color="#25D366" />
          <Text className="text-xs text-gray-500 mt-1">Camera</Text>
        </View>
        <View className="items-center">
          <Ionicons name="images-outline" size={20} color="#25D366" />
          <Text className="text-xs text-gray-500 mt-1">Gallery</Text>
        </View>
        <View className="items-center">
          <Ionicons name="document-outline" size={20} color="#25D366" />
          <Text className="text-xs text-gray-500 mt-1">Files</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}