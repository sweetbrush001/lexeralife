/**
 * Helper functions for working with Cloudinary resources
 */

// Cloud configuration
const cloudConfig = {
  cloudName: 'dxpanjyqp'
};

// ID mappings for relaxation sounds with validation
const CLOUDINARY_AUDIO_IDS = {
  rain: 'vqqkab5yanpgupyi9m5d',     // rainfall
  forest: 'ionogcelyaksonrbucir',   // forest-ambience
  waves: 'dptus7zquwspyqnshxkc',    // ocean-waves  
  fire: 'e2ubw9huyiflemppa1q1',     // crackling-fire
  piano: 'jqejaemsv3830ct0rvlm',    // piano
};

/**
 * Validate and test Cloudinary resources with better error handling
 * @param {Object} urls - Object mapping track IDs to URLs
 * @returns {Promise<{valid: boolean, invalidResources: string[]}>}
 */
export const validateCloudinaryResources = async (urls) => {
  if (!urls || Object.keys(urls).length === 0) {
    console.log('No URLs to validate');
    return { valid: true, invalidResources: [] };
  }
  
  const invalidResources = [];
  let validationPromises = [];
  
  try {
    console.log(`Validating ${Object.keys(urls).length} resources`);
    
    // Build validation promises
    for (const [id, url] of Object.entries(urls)) {
      if (!url) {
        console.warn(`Missing URL for ${id}`);
        invalidResources.push(id);
        continue;
      }
      
      const promise = fetch(url, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            console.warn(`Resource ${id} returned status ${response.status}`);
            invalidResources.push(id);
            return false;
          }
          return true;
        })
        .catch(error => {
          console.error(`Error validating resource ${id}:`, error);
          invalidResources.push(id);
          return false;
        });
      
      validationPromises.push(promise);
    }
    
    // Wait for all validations to complete
    await Promise.all(validationPromises);
    
    const allValid = invalidResources.length === 0;
    return { valid: allValid, invalidResources };
  } catch (error) {
    console.error('Error during resource validation:', error);
    return { valid: false, invalidResources };
  }
};

/**
 * Generate a Cloudinary URL for an audio file
 */
export const getAudioUrl = (publicId, options = {}) => {
  if (!publicId) {
    console.warn('Missing public ID for Cloudinary resource');
    return null;
  }
  
  const { cloudName = cloudConfig.cloudName, format = 'mp3' } = options;
  return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.${format}`;
};

/**
 * Generate URLs for all relaxation sounds with validation
 */
export const getAllRelaxationSoundUrls = () => {
  const urls = {};
  
  try {
    for (const [trackId, publicId] of Object.entries(CLOUDINARY_AUDIO_IDS)) {
      if (!publicId) {
        console.warn(`Missing public ID for track: ${trackId}`);
        continue;
      }
      urls[trackId] = getAudioUrl(publicId);
    }
    return urls;
  } catch (error) {
    console.error('Error generating relaxation sound URLs:', error);
    return {};
  }
};

export { cloudConfig, CLOUDINARY_AUDIO_IDS };
