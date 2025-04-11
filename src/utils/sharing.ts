/**
 * Utilities for encoding and decoding shareable predictions
 */

/**
 * Encode grid data to a shareable URL parameter
 * @param gridData The grid data to encode
 * @returns The encoded string
 */
export const encodeGridData = (gridData: Record<string, Record<string, string>>): string => {
  try {
    // Convert grid data to JSON string
    const jsonString = JSON.stringify(gridData);
    
    // Encode to Base64
    return btoa(jsonString);
  } catch (error) {
    console.error('Error encoding grid data:', error);
    throw new Error('Failed to encode grid data');
  }
};

/**
 * Decode a shareable URL parameter to grid data
 * @param encoded The encoded string
 * @returns The decoded grid data
 */
export const decodeGridData = (encoded: string): Record<string, Record<string, string>> => {
  try {
    // Decode from Base64
    const jsonString = atob(encoded);
    
    // Parse JSON
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decoding grid data:', error);
    throw new Error('Failed to decode grid data');
  }
};

/**
 * Create a shareable URL with the encoded grid data
 * @param gridData The grid data to encode
 * @returns The full shareable URL
 */
export const createShareableUrl = (gridData: Record<string, Record<string, string>>): string => {
  try {
    const encoded = encodeGridData(gridData);
    
    // Create URL with the encoded data
    const url = new URL(window.location.href);
    url.searchParams.set('prediction', encoded);
    
    return url.toString();
  } catch (error) {
    console.error('Error creating shareable URL:', error);
    throw new Error('Failed to create shareable URL');
  }
};