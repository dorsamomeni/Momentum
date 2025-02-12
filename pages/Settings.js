import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from '@react-navigation/native';

const Settings = () => {
  const { weightUnit, toggleWeightUnit } = useSettings();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Weight Unit Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weight Unit</Text>
        <TouchableOpacity 
          style={styles.option}
          onPress={toggleWeightUnit}
        >
          <Text style={styles.optionText}>
            Currently using {weightUnit.toUpperCase()}
          </Text>
          <Text style={styles.optionHint}>
            Tap to switch to {weightUnit === 'kg' ? 'LBS' : 'KG'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Photo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Photo</Text>
        <TouchableOpacity style={styles.option}>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Change Profile Photo</Text>
            <Icon name="chevron-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginLeft: 40,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  option: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  optionHint: {
    fontSize: 14,
    color: '#666',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 28,
    color: "#000",
  },
});

export default Settings; 