/**
 * Security & Helper functions for Live Stream URL validation & automatic embedding
 */

export interface UrlValidationResult {
  isValid: boolean;
  platform: 'facebook' | 'youtube' | 'streamyard' | 'tamasha' | 'twitch' | 'custom' | null;
  embedUrl: string;
  videoId?: string;
  error?: string;
}

const ALLOWED_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'web.facebook.com',
  'fb.watch',
  'fb.com',
  'streamyard.com',
  'www.streamyard.com',
  'tamashaweb.com',
  'www.tamashaweb.com',
  'tamasha.com.pk',
  'www.tamasha.com.pk',
  'twitch.tv',
  'www.twitch.tv',
  'player.twitch.tv',
  'vimeo.com',
  'player.vimeo.com',
  'dailymotion.com',
  'www.dailymotion.com'
];

/**
 * Validates any live stream URL (YouTube, Facebook, Tamasha, StreamYard, Twitch, custom streams)
 * and formats the embed URL with auto-play parameters enabled.
 */
export function validateAndConvertStreamUrl(
  rawUrl: string, 
  explicitPlatform?: 'facebook' | 'youtube' | 'streamyard' | 'tamasha' | 'twitch' | 'custom',
  autoPlay: boolean = true
): UrlValidationResult {
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

    // Determine Platform
    let platform: 'facebook' | 'youtube' | 'streamyard' | 'tamasha' | 'twitch' | 'custom' = 'youtube';
    if (hostname.includes('facebook') || hostname.includes('fb.watch') || hostname.includes('fb.com')) {
      platform = 'facebook';
    } else if (hostname.includes('streamyard')) {
      platform = 'streamyard';
    } else if (hostname.includes('tamasha')) {
      platform = 'tamasha';
    } else if (hostname.includes('twitch')) {
      platform = 'twitch';
    } else if (hostname.includes('youtube') || hostname.includes('youtu.be')) {
      platform = 'youtube';
    } else if (explicitPlatform) {
      platform = explicitPlatform;
    } else {
      platform = 'custom';
    }

    // 1. Convert Tamasha
    if (platform === 'tamasha') {
      let embedUrl = parsed.toString();
      if (parsed.pathname.startsWith('/live/') || parsed.pathname.startsWith('/watch/')) {
        embedUrl = `https://tamashaweb.com${parsed.pathname}${parsed.search}`;
      } else if (!embedUrl.includes('tamashaweb.com') && !embedUrl.includes('tamasha.com.pk')) {
        embedUrl = `https://tamashaweb.com${parsed.pathname}${parsed.search}`;
      }

      if (autoPlay && !embedUrl.includes('autoplay')) {
        embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=true';
      }

      const pathParts = parsed.pathname.split('/').filter(Boolean);
      const streamId = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'tamasha-stream';

      return {
        isValid: true,
        platform: 'tamasha',
        embedUrl,
        videoId: streamId
      };
    }

    // 2. Convert StreamYard
    if (platform === 'streamyard') {
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      const streamId = pathParts.length > 0 ? pathParts[pathParts.length - 1] : '';

      let embedUrl = parsed.toString();
      if (parsed.pathname.startsWith('/watch/') || parsed.pathname.startsWith('/embed/')) {
        embedUrl = `https://streamyard.com${parsed.pathname}${parsed.search}`;
      } else if (streamId) {
        embedUrl = `https://streamyard.com/watch/${streamId}`;
      }

      if (autoPlay && !embedUrl.includes('autoplay')) {
        embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
      }

      return {
        isValid: true,
        platform: 'streamyard',
        embedUrl,
        videoId: streamId
      };
    }

    // 3. Convert Twitch
    if (platform === 'twitch') {
      let channel = '';
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        channel = pathParts[0];
      }
      const host = typeof window !== 'undefined' ? window.location.hostname : 'thesportsroom.online';
      const embedUrl = `https://player.twitch.tv/?channel=${channel}&parent=${host}&autoplay=${autoPlay}`;

      return {
        isValid: true,
        platform: 'twitch',
        embedUrl,
        videoId: channel
      };
    }

    // 4. Convert YouTube
    if (platform === 'youtube') {
      let videoId = '';

      if (hostname.includes('youtu.be')) {
        videoId = parsed.pathname.replace(/^\//, '').split('/')[0];
      } else if (parsed.pathname.includes('/watch')) {
        videoId = parsed.searchParams.get('v') || '';
      } else if (parsed.pathname.includes('/embed/')) {
        const parts = parsed.pathname.split('/embed/');
        videoId = parts[1] ? parts[1].split('/')[0].split('?')[0] : '';
      } else if (parsed.pathname.includes('/live/')) {
        const parts = parsed.pathname.split('/live/');
        videoId = parts[1] ? parts[1].split('/')[0].split('?')[0] : '';
      } else if (parsed.pathname.includes('/shorts/')) {
        const parts = parsed.pathname.split('/shorts/');
        videoId = parts[1] ? parts[1].split('/')[0].split('?')[0] : '';
      }

      if (!videoId) {
        const pathParts = parsed.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          videoId = pathParts[pathParts.length - 1];
        }
      }

      videoId = videoId.replace(/[^a-zA-Z0-9_-]/g, '');

      if (!videoId) {
        return {
          isValid: false,
          platform: 'youtube',
          embedUrl: '',
          error: 'Could not extract valid YouTube video ID from the provided link.'
        };
      }

      const autoPlayParam = autoPlay ? 'autoplay=1' : 'autoplay=0';
      // Use YouTube-nocookie with enablejsapi=1, modestbranding=1, playsinline=1, rel=0, showinfo=0, controls=1, iv_load_policy=3, disablekb=0
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?${autoPlayParam}&mute=0&enablejsapi=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&controls=1&fs=1&disablekb=0`;
      return {
        isValid: true,
        platform: 'youtube',
        embedUrl,
        videoId
      };
    }

    // 5. Convert Facebook
    if (platform === 'facebook') {
      const fullUrl = parsed.toString();
      const encodedUrl = encodeURIComponent(fullUrl);
      const autoPlayParam = autoPlay ? 'autoplay=true' : 'autoplay=false';
      const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=1280&${autoPlayParam}&allowfullscreen=true`;

      return {
        isValid: true,
        platform: 'facebook',
        embedUrl
      };
    }

    // 6. Generic / Custom Video URL (MP4, HLS, or direct iframe embed URL)
    let embedUrl = parsed.toString();
    if (autoPlay && !embedUrl.includes('autoplay')) {
      embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
    }

    return {
      isValid: true,
      platform: 'custom',
      embedUrl
    };

  } catch (err) {
    return {
      isValid: false,
      platform: null,
      embedUrl: '',
      error: 'Invalid URL format. Please provide a valid stream link.'
    };
  }
}
