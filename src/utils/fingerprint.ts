// Simple browser fingerprinting for anonymous user identification
// This is not meant to be bulletproof, just good enough for persistence

export async function getBrowserFingerprint(): Promise<string> {
  const components: string[] = [];
  
  // Basic browser properties
  components.push(navigator.userAgent);
  components.push(navigator.language);
  components.push(screen.width + 'x' + screen.height);
  components.push(screen.colorDepth.toString());
  components.push(new Date().getTimezoneOffset().toString());
  
  // Canvas fingerprinting
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('F1 Calculator', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('F1 Calculator', 4, 17);
      
      const dataURL = canvas.toDataURL();
      components.push(dataURL);
    }
  } catch (e) {
    components.push('canvas-error');
  }
  
  // Create a hash from components
  const fingerprint = await hashString(components.join('|||'));
  
  // Also store in localStorage as backup
  const storedFingerprint = localStorage.getItem('f1_fingerprint');
  if (storedFingerprint) {
    return storedFingerprint;
  }
  
  localStorage.setItem('f1_fingerprint', fingerprint);
  return fingerprint;
}

async function hashString(str: string): Promise<string> {
  // Use Web Crypto API if available
  if (crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback to simple hash
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}