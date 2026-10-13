import React, { useEffect } from "react";

export interface SEOMetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  schemaData?: object | null;
}

export default function SEOMetaTags({
  title = "The Sports Room | Live Sports Coverage & Tactical Analysis",
  description = "Follow live cricket scores, real-time match updates, upcoming schedules, and complete coverage on The Sports Room.",
  keywords = "The Sports Room, cricket, live scores, football, f1, tennis",
  canonicalUrl,
  ogImage = "https://thesportsroom.online/logo-preview.png",
  ogType = "website",
  schemaData
}: SEOMetaTagsProps) {
  useEffect(() => {
    // 1. Update Document Title
    if (title) {
      document.title = title;
    }

    // 2. Helper to set or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, true);
      setMeta("twitter:description", description);
    }

    if (keywords) {
      setMeta("keywords", keywords);
    }

    if (title) {
      setMeta("og:title", title, true);
      setMeta("twitter:title", title);
    }

    if (ogImage) {
      setMeta("og:image", ogImage, true);
      setMeta("twitter:image", ogImage);
    }

    setMeta("og:type", ogType, true);

    // 3. Dynamically manage Canonical URL
    const resolvedCanonical = canonicalUrl || (window.location.origin + window.location.pathname);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", resolvedCanonical);

    // 4. Structured Data
    if (schemaData) {
      const scriptId = "dynamic-json-ld";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schemaData);
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, schemaData]);

  return null;
}
