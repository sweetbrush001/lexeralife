import React, { useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
// Reduced width from 82% to 70% of screen width
const PANEL_WIDTH = width * 0.7;

const SidePanel = ({ 
  isOpen, 
  slideAnim, 
  overlayOpacity, 
  togglePanel, 
  currentUser, 
  navigation,
  handleLogout
}) => {
  // Create animation value for menu items
  const menuItemsAnimValue = useRef(new Animated.Value(0)).current;

  // Optimize with useCallback for menu item press handler
  const handleMenuItemPress = useCallback((screen) => {
    // Provide haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Close the panel with animation
    togglePanel();
    
    // Handle the navigation after panel closes
    setTimeout(() => {
      if (screen === 'logout') {
        handleLogout();
      } else {
        navigation.navigate(screen);
      }
    }, 300);
  }, [togglePanel, handleLogout, navigation]);

  // Animate menu items when panel opens
  useEffect(() => {
    if (isOpen) {
      Animated.timing(menuItemsAnimValue, {
        toValue: 1,
        duration: 400, // Slightly faster animation
        delay: 150,
        useNativeDriver: true,
      }).start();
    } else {
      menuItemsAnimValue.setValue(0);
    }
  }, [isOpen, menuItemsAnimValue]);

  // Generate a profile image URL (memoized)
  const getProfileImage = useCallback(() => {
    if (currentUser?.profileImage) {
      return { uri: currentUser.profileImage };
    } else if (currentUser?.photoURL) {
      return { uri: currentUser.photoURL };
    }
    return require('../../assets/profilepic.png');
  }, [currentUser]);
  
  return (
    <>
      {/* Overlay with improved opacity */}
      <Animated.View 
        style={[
          styles.overlay,
          { 
            opacity: overlayOpacity,
            pointerEvents: isOpen ? 'auto' : 'none'
          }
        ]} 
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={togglePanel}
        />
      </Animated.View>

      {/* Side Panel with reduced width */}
      <Animated.View 
        style={[
          styles.sidePanel,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {/* Higher intensity for less transparency */}
        <BlurView intensity={40} tint="light" style={styles.sidePanelContent}>
          {/* Header with gradient */}
          <LinearGradient
            colors={['#5D5FEF', '#8C5FEF', '#EF5DA8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sidePanelHeader}
          >
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={togglePanel}
              activeOpacity={0.8}
            >
              <Feather name="x" size={18} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={getProfileImage()}
                  style={styles.sidePanelProfilePic}
                />
                {/* Online status indicator */}
                <View style={styles.statusIndicator} />
              </View>
              <Text style={styles.sidePanelUsername}>
                {currentUser ? currentUser.displayName : 'Lexera User'}
              </Text>
              <Text style={styles.sidePanelEmail}>
                {currentUser ? currentUser.email : ''}
              </Text>
              
              {/* Premium badge */}
              <View style={styles.premiumBadge}>
                <Feather name="star" size={10} color="#fff" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            </View>
          </LinearGradient>
          
          {/* Menu with animations */}
          <Animated.View 
            style={[
              styles.sidePanelMenu,
              {
                opacity: menuItemsAnimValue,
                transform: [{
                  translateY: menuItemsAnimValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            <MenuItem 
              icon="user" 
              title="Profile" 
              onPress={() => handleMenuItemPress('profile')} 
            />
            
            <MenuItem 
              icon="settings" 
              title="Settings" 
              onPress={() => handleMenuItemPress('settings')} 
            />
            
            <MenuItem 
              icon="message-square" 
              title="Feedback" 
              onPress={() => handleMenuItemPress('Feedback')} 
              badge="NEW"
            />
            
            <MenuItem 
              icon="help-circle" 
              title="Help & Support" 
              onPress={() => handleMenuItemPress('help')} 
            />
            
            <View style={styles.divider} />
            
            <MenuItem 
              icon="log-out" 
              title="Logout" 
              onPress={() => handleMenuItemPress('logout')} 
              isLogout={true}
            />
          </Animated.View>
          
          <View style={styles.sidePanelFooter}>
            <Image 
              source={require('../../assets/Logo.png')} 
              style={styles.footerLogo} 
              resizeMode="contain"
            />
            <Text style={styles.versionText}>Lexera Life v1.0.2</Text>
            <Text style={styles.copyrightText}>© 2025 Lexera Life</Text>
          </View>
        </BlurView>
      </Animated.View>
    </>
  );
};

// Optimized MenuItem component with memoization
const MenuItem = memo(({ icon, title, onPress, isLogout = false, badge }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
  
  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={({pressed}) => [
        styles.menuItemWrapper,
        {opacity: pressed ? 0.9 : 1}
      ]}
    >
      <Animated.View
        style={[
          styles.menuItem, 
          isLogout && styles.logoutItem,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={[
          styles.menuIconContainer,
          isLogout && styles.logoutIconContainer
        ]}>
          <Feather name={icon} size={18} color={isLogout ? "#fff" : "#5D5FEF"} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={[
            styles.menuItemText,
            isLogout && styles.logoutText
          ]}>
            {title}
          </Text>
          
          {/* Badge for new items */}
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        
        {!isLogout && (
          <Feather name="chevron-right" size={16} color="#C0C0C0" style={styles.menuArrow} />
        )}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', // More opaque overlay
    zIndex: 1000,
    backdropFilter: 'blur(5px)',
  },
  overlayTouchable: {
    flex: 1,
  },
  sidePanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PANEL_WIDTH, // Reduced width
    height: '100%',
    zIndex: 1001,
    elevation: 10,
  },
  sidePanelContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Less transparent (more opaque)
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  sidePanelHeader: {
    paddingVertical: 40,
    paddingHorizontal: 16, // Reduced horizontal padding
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 34, // Slightly smaller
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 16,
  },
  profileImageContainer: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 40,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    position: 'relative',
  },
  sidePanelProfilePic: {
    width: 75, // Slightly smaller
    height: 75,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CD964',
    position: 'absolute',
    bottom: 6,
    right: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  sidePanelUsername: {
    fontSize: 20, // Smaller font
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sidePanelEmail: {
    fontSize: 13, // Smaller font
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.35)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginTop: 4,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 3,
  },
  sidePanelMenu: {
    padding: 14,
    flex: 1,
  },
  menuItemWrapper: {
    marginBottom: 8, // Reduced spacing
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Slightly reduced
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // More opaque
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  menuIconContainer: {
    width: 40, // Smaller
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#5D5FEF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    fontSize: 15, // Smaller font
    color: '#333',
    fontWeight: '500',
  },
  menuArrow: {
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 14,
    marginHorizontal: 8,
  },
  logoutItem: {
    backgroundColor: '#FFF0F8',
  },
  logoutIconContainer: {
    backgroundColor: '#EF5DA8',
    shadowColor: '#EF5DA8',
  },
  logoutText: {
    color: '#EF5DA8',
    fontWeight: '600',
  },
  sidePanelFooter: {
    padding: 18, // Reduced padding
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  footerLogo: {
    width: 38, // Smaller
    height: 38,
    marginBottom: 10,
  },
  versionText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 3,
    fontWeight: '500',
  },
  copyrightText: {
    fontSize: 11,
    color: '#AAA',
  },
  badge: {
    backgroundColor: '#5D5FEF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default React.memo(SidePanel);
