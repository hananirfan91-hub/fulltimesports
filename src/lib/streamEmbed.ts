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
      // Clean standard YouTube embed URL without restrictive API origin/JS flags that trigger YouTube Kids/Restricted mode on mobile devices
      const embedUrl = `https://www.youtube.com/embed/${videoId}?${autoPlayParam}&playsinline=1&rel=0`;
      return {
        isValid: true,
        platform: 'youtube',
        embedUrl,
        videoId
      };
    }

    // 5. Convert Facebook
    if (platform === 'facebook') {
      // If it is already a facebook plugins/video.php or plugins/post.php URL, don't re-wrap it
      if (parsed.pathname.includes('/plugins/video.php') || parsed.pathname.includes('/plugins/post.php')) {
        let embedUrl = parsed.toString();
        if (autoPlay && !embedUrl.includes('autoplay')) {
          embedUrl += '&autoplay=true';
        }
        if (!embedUrl.includes('allowfullscreen')) {
          embedUrl += '&allowfullscreen=true';
        }
        return {
          isValid: true,
          platform: 'facebook',
          embedUrl
        };
      }

      // Check if it has ?v= parameter (e.g. facebook.com/watch/?v=123456)
      const vParam = parsed.searchParams.get('v');
      let canonicalUrl = parsed.toString();
      
      if (vParam) {
        canonicalUrl = `https://www.facebook.com/watch/?v=${vParam}`;
      } else if (parsed.pathname.includes('/videos/')) {
        // e.g. facebook.com/user/videos/123456789/
        canonicalUrl = `https://www.facebook.com${parsed.pathname}`;
      } else if (parsed.pathname.includes('/reel/')) {
        // e.g. facebook.com/reel/123456789/
        canonicalUrl = `https://www.facebook.com${parsed.pathname}`;
      }

      const encodedUrl = encodeURIComponent(canonicalUrl);
      const autoPlayParam = autoPlay ? 'autoplay=true' : 'autoplay=false';
      const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=1280&${autoPlayParam}&allowfullscreen=true&muted=0`;

      const isShareLink = parsed.pathname.includes('/share/v/') || parsed.pathname.includes('/share/r/') || hostname.includes('fb.watch');

      return {
        isValid: true,
        platform: 'facebook',
        embedUrl,
        videoId: vParam || parsed.pathname.split('/').filter(Boolean).pop(),
        error: isShareLink ? 'Facebook share links (/share/v/) may require public embed permissions or direct video link.' : undefined
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

/**
 * Ensures any stream URL (whether already stored in DB, raw YouTube link, or legacy youtube-nocookie)
 * is cleanly translated to the most compatible playable embed URL on the current page.
 */
export function getPlayableStreamEmbedUrl(
  urlOrEmbed?: string | null,
  platform?: 'facebook' | 'youtube' | 'streamyard' | 'tamasha' | 'twitch' | 'custom' | string,
  autoPlay: boolean = true
): string {
  if (!urlOrEmbed || typeof urlOrEmbed !== 'string') return '';

  const trimmed = urlOrEmbed.trim();
  if (!trimmed) return '';

  // If it's a YouTube link or contains youtube-nocookie or youtube.com
  if (
    trimmed.includes('youtube.com') ||
    trimmed.includes('youtu.be') ||
    trimmed.includes('youtube-nocookie.com') ||
    platform === 'youtube'
  ) {
    // Extract video ID safely
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const match = trimmed.match(regExp);
    const videoId = match && match[1] ? match[1] : trimmed.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 11);

    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      const autoPlayParam = autoPlay ? 'autoplay=1' : 'autoplay=0';
      return `https://www.youtube.com/embed/${videoId}?${autoPlayParam}&playsinline=1&rel=0`;
    }
  }

  // If it's Facebook, Twitch, Tamasha, StreamYard or already processed URL
  const conversion = validateAndConvertStreamUrl(trimmed, platform as any, autoPlay);
  if (conversion.isValid && conversion.embedUrl) {
    return conversion.embedUrl;
  }

  return trimmed;
}

