import * as tf from '@tensorflow/tfjs';

/**
 * Configure TensorFlow.js to use the WebGL backend
 * This avoids the need for native dependencies like 'gl'
 */
export const configureTensorFlow = async () => {
  try {
    // Set the backend to WebGL
    await tf.setBackend('webgl');
    
    // Log the backend being used
    console.log(`TensorFlow.js using backend: ${tf.getBackend()}`);
    
    // Configure memory management
    tf.env().set('WEBGL_FORCE_F16_TEXTURES', false);
    tf.env().set('WEBGL_RENDER_FLOAT32_ENABLED', true);
    
    // Return the configured TensorFlow instance
    return tf;
  } catch (error) {
    console.error('Failed to configure TensorFlow.js:', error);
    
    // Fallback to CPU if WebGL fails
    try {
      await tf.setBackend('cpu');
      console.log(`TensorFlow.js fallback to backend: ${tf.getBackend()}`);
      return tf;
    } catch (fallbackError) {
      console.error('Failed to set fallback backend:', fallbackError);
      throw new Error('Could not initialize TensorFlow.js');
    }
  }
};

export default configureTensorFlow; 