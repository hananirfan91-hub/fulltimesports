/**
 * IndexNow Protocol Integration for The Sports Room
 * Automatically submits added/updated/deleted URLs directly to Bing, Yandex, Seznam, and Naver
 * Specification: https://www.indexnow.org/documentation
 */

export const INDEXNOW_KEY = "c03b12368c8b4bf09bc77a4a98e89f81";
export const INDEXNOW_HOST = "thesportsroom.online";
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation?: string;
  urlList: string[];
}

export interface IndexNowResponse {
  success: boolean;
  message: string;
  submittedCount: number;
  timestamp: string;
}

/**
 * Submit single or multiple URLs to Bing and IndexNow search engines via our backend API
 */
export async function submitToIndexNow(urls: string | string[]): Promise<IndexNowResponse> {
  const urlList = Array.isArray(urls) ? urls : [urls];
  
  // Format URLs to ensure absolute URLs on the primary domain
  const normalizedUrls = urlList.map(url => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `https://${INDEXNOW_HOST}${cleanPath}`;
  });

  try {
    const response = await fetch('/api/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: normalizedUrls
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: data.message || `Successfully submitted ${normalizedUrls.length} URLs to IndexNow (Bing & Search Engines)`,
        submittedCount: normalizedUrls.length,
        timestamp: new Date().toISOString()
      };
    } else {
      const errText = await response.text();
      return {
        success: false,
        message: `IndexNow submission error (${response.status}): ${errText}`,
        submittedCount: 0,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error: any) {
    console.warn("[IndexNow] Submission request failed:", error);
    return {
      success: false,
      message: error?.message || 'Network error while submitting to IndexNow',
      submittedCount: 0,
      timestamp: new Date().toISOString()
    };
  }
}
