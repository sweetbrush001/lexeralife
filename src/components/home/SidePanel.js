import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = width * 0.8;

const SidePanel = ({ 
  isPanelOpen, 
  slideAnim, 
  overlayOpacity, 
  togglePanel, 
  currentUser, 
  getProfileImage, 
  handleMenuItemPress 
}) => {
  return (
    <>
      {/* Overlay when panel is open */}
      <Animated.View 
        style={[
          styles.overlay,
          { 
            opacity: overlayOpacity,
            pointerEvents: isPanelOpen ? 'auto' : 'none'
          }
        ]} 
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={togglePanel}
        />
      </Animated.View>

      {/* Side Panel */}
      <Animated.View 
        style={[
          styles.sidePanel,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <BlurView intensity={30} style={styles.sidePanelContent}>
          <View style={styles.sidePanelHeader}>
            <View style={styles.profileSection}>
              <Image
                source={getProfileImage()}
                style={styles.sidePanelProfilePic}
              />
              <View style={styles.userInfoContainer}>
                <Text style={styles.sidePanelUsername}>
                  {currentUser ? currentUser.displayName : 'Loading...'}
                </Text>
                <Text style={styles.sidePanelEmail}>
                  {currentUser ? currentUser.email : ''}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={togglePanel}
            >
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.sidePanelMenu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('profile')}
            >
              <View style={styles.menuIconContainer}>
                <Feather name="user" size={20} color="#FF6B6B" />
              </View>
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('settings')}
            >
              <View style={styles.menuIconContainer}>
                <Feather name="settings" size={20} color="#FF6B6B" />
              </View>
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('feedback')}
            >
              <View style={styles.menuIconContainer}>
                <Feather name="message-square" size={20} color="#FF6B6B" />
              </View>
              <Text style={styles.menuItemText}>Feedback</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.logoutItem]}
              onPress={() => handleMenuItemPress('Auth')}
            >
              <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                <Feather name="log-out" size={20} color="#fff" />
              </View>
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.sidePanelFooter}>
            <Text style={styles.versionText}>Lexera Life v1.0.2</Text>
            <Text style={styles.copyrightText}>© 2025 Lexera Life</Text>
          </View>
        </BlurView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1000,
  },
  overlayTouchable: {
    flex: 1,
  },
  sidePanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PANEL_WIDTH,
    height: '100%',
    zIndex: 1001,
    elevation: 10,
  },
  sidePanelContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  sidePanelHeader: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#FFE6E6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidePanelProfilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfoContainer: {
    marginLeft: 15,
  },
  sidePanelUsername: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sidePanelEmail: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidePanelMenu: {
    padding: 15,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE6E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
    marginHorizontal: 10,
  },
  logoutItem: {
    backgroundColor: '#FFF0F0',
  },
  logoutIconContainer: {
    backgroundColor: '#FF6B6B',
  },
  sidePanelFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
});

export default React.memo(SidePanel);
