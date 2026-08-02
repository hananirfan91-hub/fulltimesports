/**
 * Security & Helper functions for Live Stream URL validation & automatic embedding
 */

export interface UrlValidationResult {
  isValid: boolean;
  platform: 'facebook' | 'youtube' | 'streamyard' | null;
  embedUrl: string;
  videoId?: string;
  error?: string;
}

const ALLOWED_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'web.facebook.com',
  'fb.watch',
  'streamyard.com',
  'www.streamyard.com'
];

/**
 * Validates if a URL belongs to allowed Facebook, YouTube, or StreamYard domains and returns converted embed URL
 */
export function validateAndConvertStreamUrl(rawUrl: string, explicitPlatform?: 'facebook' | 'youtube' | 'streamyard'): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      platform: null,
      embedUrl: '',
      error: 'URL cannot be empty'
    };
  }

  const trimmed = rawUrl.trim();

  // Handle iframe code paste if user accidentally pastes full <iframe> tag
  let cleanUrl = trimmed;
  if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      cleanUrl = match[1];
    }
  }

  try {
    let parsed: URL;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      parsed = new URL(`https://${cleanUrl}`);
    } else {
      parsed = new URL(cleanUrl);
    }

    const hostname = parsed.hostname.toLowerCase();
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));

    if (!isAllowedDomain) {
      return {
        isValid: false,
        platform: null,
        embedUrl: '',
        error: 'Security Error: Only official YouTube, Facebook, and StreamYard (streamyard.com) URLs are accepted.'
      };
    }

    // Determine Platform
    let platform: 'facebook' | 'youtube' | 'streamyard' = 'youtube';
    if (hostname.includes('facebook') || hostname.includes('fb.watch')) {
      platform = 'facebook';
    } else if (hostname.includes('streamyard')) {
      platform = 'streamyard';
    } else if (hostname.includes('youtube') || hostname.includes('youtu.be')) {
      platform = 'youtube';
    } else if (explicitPlatform) {
      platform = explicitPlatform;
    }

    // Convert StreamYard
    if (platform === 'streamyard') {
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      const streamId = pathParts.length > 0 ? pathParts[pathParts.length - 1] : '';

      if (!streamId && !cleanUrl.includes('streamyard.com')) {
        return {
          isValid: false,
          platform: 'streamyard',
          embedUrl: '',
          error: 'Could not extract valid StreamYard broadcast ID from the provided link.'
        };
      }

      // Format clean embed URL (watch or embed or full raw streamyard link)
      let embedUrl = parsed.toString();
      if (parsed.pathname.startsWith('/watch/') || parsed.pathname.startsWith('/embed/')) {
        embedUrl = `https://streamyard.com${parsed.pathname}${parsed.search}`;
      } else if (streamId) {
        embedUrl = `https://streamyard.com/watch/${streamId}`;
      }

      return {
        isValid: true,
        platform: 'streamyard',
        embedUrl,
        videoId: streamId
      };
    }

    // Convert YouTube
    if (platform === 'youtube') {
      let videoId = '';

      if (hostname.includes('youtu.be')) {
        // e.g. https://youtu.be/abc1234
        videoId = parsed.pathname.replace(/^\//, '').split('/')[0];
      } else if (parsed.pathname.includes('/watch')) {
        // e.g. https://www.youtube.com/watch?v=abc1234
        videoId = parsed.searchParams.get('v') || '';
      } else if (parsed.pathname.includes('/embed/')) {
        // e.g. https://www.youtube.com/embed/abc1234
        const parts = parsed.pathname.split('/embed/');
        videoId = parts[1] ? parts[1].split('/')[0].split('?')[0] : '';
      } else if (parsed.pathname.includes('/live/')) {
        // e.g. https://www.youtube.com/live/abc1234
        const parts = parsed.pathname.split('/live/');
        videoId = parts[1] ? parts[1].split('/')[0].split('?')[0] : '';
      } else if (parsed.pathname.includes('/shorts/')) {
        const parts = parsed.pathname.split('/shorts/');
        videoId = parts[1] ? parts[1].split('/')[0].split('?')[0] : '';
      }

      if (!videoId) {
        // Fallback check query params or pathname
        const pathParts = parsed.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          videoId = pathParts[pathParts.length - 1];
        }
      }

      // Remove extra params from videoId if any remain
      videoId = videoId.replace(/[^a-zA-Z0-9_-]/g, '');

      if (!videoId) {
        return {
          isValid: false,
          platform: 'youtube',
          embedUrl: '',
          error: 'Could not extract valid YouTube video ID from the provided link.'
        };
      }

      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return {
        isValid: true,
        platform: 'youtube',
        embedUrl,
        videoId
      };
    }

    // Convert Facebook
    if (platform === 'facebook') {
      // For Facebook, standard plugins embed requires full encoded URL
      const fullUrl = parsed.toString();
      const encodedUrl = encodeURIComponent(fullUrl);
      const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=1280&autoplay=true`;

      return {
        isValid: true,
        platform: 'facebook',
        embedUrl
      };
    }

    return {
      isValid: false,
      platform: null,
      embedUrl: '',
      error: 'Unsupported platform format'
    };

  } catch (err) {
    return {
      isValid: false,
      platform: null,
      embedUrl: '',
      error: 'Invalid URL format'
    };
  }
}
