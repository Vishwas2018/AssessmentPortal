// src/lib/mediaStorage.ts
// Signed URL helper for private Supabase Storage
// Supports caching to avoid repeated signing calls

import { supabase } from "./supabase";

// In-memory cache for signed URLs
// Key: `${bucket}:${path}`, Value: { url: string, expiresAt: number }
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

// Default expiration buffer (5 minutes before actual expiry)
const EXPIRY_BUFFER_SECONDS = 300;

/**
 * Get a signed URL for a private storage asset
 * Uses caching to avoid repeated signing calls
 */
export async function getSignedMediaUrl(
  bucket: string,
  path: string,
  expiresInSeconds: number = 3600, // 1 hour default
): Promise<string | null> {
  const cacheKey = `${bucket}:${path}`;
  const now = Date.now();

  // Check cache first
  const cached = signedUrlCache.get(cacheKey);
  if (cached && cached.expiresAt > now + EXPIRY_BUFFER_SECONDS * 1000) {
    return cached.url;
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    if (data?.signedUrl) {
      // Cache the signed URL
      signedUrlCache.set(cacheKey, {
        url: data.signedUrl,
        expiresAt: now + expiresInSeconds * 1000,
      });
      return data.signedUrl;
    }

    return null;
  } catch (err) {
    console.error("Error getting signed URL:", err);
    return null;
  }
}

/**
 * Get multiple signed URLs at once (batch operation)
 */
export async function getSignedMediaUrls(
  items: { bucket: string; path: string }[],
  expiresInSeconds: number = 3600,
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const now = Date.now();

  // Separate cached and uncached items
  const uncached: { bucket: string; path: string; key: string }[] = [];

  for (const item of items) {
    const cacheKey = `${item.bucket}:${item.path}`;
    const cached = signedUrlCache.get(cacheKey);

    if (cached && cached.expiresAt > now + EXPIRY_BUFFER_SECONDS * 1000) {
      results.set(cacheKey, cached.url);
    } else {
      uncached.push({ ...item, key: cacheKey });
    }
  }

  // Fetch uncached URLs in parallel
  const promises = uncached.map(async (item) => {
    const url = await getSignedMediaUrl(
      item.bucket,
      item.path,
      expiresInSeconds,
    );
    if (url) {
      results.set(item.key, url);
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * Clear the signed URL cache (useful on logout or session change)
 */
export function clearSignedUrlCache(): void {
  signedUrlCache.clear();
}

/**
 * Pre-warm the cache for a list of media items
 * Call this when loading an exam to pre-fetch all signed URLs
 */
export async function prewarmMediaCache(
  items: { bucket: string; path: string }[],
): Promise<void> {
  await getSignedMediaUrls(items);
}

/**
 * Resolve a media URL - handles both legacy URLs and new bucket/path format
 */
export async function resolveMediaUrl(media: {
  url?: string;
  bucket?: string;
  path?: string;
}): Promise<string | null> {
  // Legacy format: direct URL
  if (media.url) {
    return media.url;
  }

  // New format: bucket + path (private storage)
  if (media.bucket && media.path) {
    return getSignedMediaUrl(media.bucket, media.path);
  }

  return null;
}

/**
 * Check if a URL is a Supabase storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes(".supabase.co/storage/");
}

/**
 * Extract bucket and path from a Supabase storage URL
 * Useful for migrating legacy URLs to new format
 */
export function parseSupabaseStorageUrl(
  url: string,
): { bucket: string; path: string } | null {
  const match = url.match(
    /\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)/,
  );
  if (match) {
    return {
      bucket: match[1],
      path: decodeURIComponent(match[2]),
    };
  }
  return null;
}
