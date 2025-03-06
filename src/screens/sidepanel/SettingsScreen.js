import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Animated, TouchableWithoutFeedback } from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../../context/SettingsContext';
import StyledToggleSwitch from '../../components/StyledToggleSwitch';
import SlideSelector from '../../components/SlideSelector';
import FancyRadioGroup from '../../components/FancyRadioGroup'; // Import the new component

const ColorPresets = [
  { label: 'Black', value: '#000000', swatch: true },
  { label: 'Navy', value: '#000080', swatch: true },
  { label: 'Gray', value: '#404040', swatch: true },
];

const FontSizePresets = [
  { label: 'Small', value: 14 },
  { label: 'Medium', value: 18 },
  { label: 'Large', value: 22 },
  { label: 'Extra Large', value: 26 },
];

const ContrastPresets = [
  { label: 'Normal', value: 1 },
  { label: 'Medium', value: 0.8 },
  { label: 'Low', value: 0.6 },
];

const SettingsScreen = () => {
  const { settings, updateSettings } = useSettings();
  const [fontsLoaded] = useFonts({
    'OpenDyslexic-Regular': require('../../../assets/fonts/OpenDyslexic3-Regular.ttf'),
  });

  const handleSettingChange = (key, value) => {
    updateSettings({
      ...settings,
      [key]: value,
    });
  };

  const previewText = useMemo(() => (
    <View style={styles.previewCard}>
      <Text style={[styles.previewLabel]}>Preview</Text>
      <Text style={[styles.sampleText, getTextStyle(settings)]}>
        The quick brown fox jumps over the lazy dog
      </Text>
    </View>
  ), [settings]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="settings" size={40} color="#666" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {previewText}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Text Size</Text>
          <View style={styles.optionsGrid}>
            {FontSizePresets.map((size) => (
              <Pressable
                key={size.value}
                style={[
                  styles.optionButton,
                  Math.round(settings.fontSize) === size.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleSettingChange('fontSize', size.value)}
              >
                <Text 
                  style={[
                    styles.optionText,
                    Math.round(settings.fontSize) === size.value && styles.optionTextSelected,
                    { fontSize: size.value * 0.8 } // Scaled down version of the actual size
                  ]}
                >
                  {size.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Text Color Section with new FancyRadioGroup */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Text Color</Text>
          <Text style={styles.sectionSubtitle}>Choose a color preset:</Text>
          
          <FancyRadioGroup
            options={ColorPresets}
            value={settings.fontColor}
            onChange={(value) => handleSettingChange('fontColor', value)}
            style={styles.colorRadioGroup}
          />
          
          <Text style={styles.sectionSubtitle}>Or enter a custom hex color:</Text>
          <TextInput
            style={styles.input}
            value={settings.fontColor}
            onChangeText={(text) => handleSettingChange('fontColor', text)}
            placeholder="#000000"
            placeholderTextColor="#666"
          />
        </View>

        {/* Contrast Section with new Slider Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contrast</Text>
          <SlideSelector 
            options={ContrastPresets}
            value={settings.contrast}
            onChange={(value) => handleSettingChange('contrast', value)}
          />
          <Text style={styles.helperText}>
            Adjust contrast to make text easier to read
          </Text>
        </View>

        {/* Dyslexic Friendly Font Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Dyslexic Friendly Font</Text>
            <StyledToggleSwitch 
              value={settings.isDyslexicFriendly}
              onToggle={() => handleSettingChange('isDyslexicFriendly', !settings.isDyslexicFriendly)} 
            />
          </View>
          <Text style={styles.toggleDescription}>
            Enables OpenDyslexic font designed to increase readability for readers with dyslexia
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getTextStyle = (settings) => ({
  fontSize: settings.fontSize,
  color: settings.fontColor,
  fontFamily: settings.isDyslexicFriendly ? 'OpenDyslexic-Regular' : undefined,
  opacity: settings.contrast,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  previewCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sampleText: {
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#666',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  colorPresets: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  colorButton: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    marginRight: 8,
  },
  colorButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#DEDEDE',
  },
  colorLabel: {
    fontSize: 12,
    color: '#666',
  },
  input: {
    height: 44,
    borderColor: '#DEDEDE',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  contrastButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  contrastButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  contrastButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  contrastButtonText: {
    fontSize: 16,
    color: '#666',
  },
  contrastButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  accessibilityButton: {
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  accessibilityButtonActive: {
    backgroundColor: '#007AFF',
  },
  accessibilityButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  accessibilityButtonTextActive: {
    color: '#fff',
  },
  // Toggle Switch Styles
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  switch: {
    position: 'relative',
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 4,
  },
  slider: {
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    // For shadow on iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    // For shadow on Android
    elevation: 2,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  colorRadioGroup: {
    marginBottom: 16,
  },
});

export default SettingsScreen;