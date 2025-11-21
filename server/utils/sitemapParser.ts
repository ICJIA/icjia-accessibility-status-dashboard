/**
 * Sitemap Parser - Extracts URLs from sitemap.xml
 */

import * as xml2js from "xml2js";
import { logger } from "./logger.js";

export interface SitemapParseResult {
  urls: string[];
  totalCount: number;
  error?: string;
}

/**
 * Parse sitemap.xml and extract all URLs
 */
export async function parseSitemap(
  sitemapUrl: string
): Promise<SitemapParseResult> {
  logger.info("Sitemap", `Parsing sitemap: ${sitemapUrl}`);

  try {
    // Fetch the sitemap
    logger.debug("Sitemap", "Fetching sitemap...");
    const response = await fetch(sitemapUrl, {
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ICJIA-Accessibility-Scanner/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch sitemap: ${response.status} ${response.statusText}`
      );
    }

    const sitemapContent = await response.text();
    logger.success(
      "Sitemap",
      `Downloaded sitemap (${sitemapContent.length} bytes)`
    );

    // Parse XML
    logger.debug("Sitemap", "Parsing XML...");
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(sitemapContent);

    // Extract URLs from sitemap
    const urls: string[] = [];

    if (result.urlset && result.urlset.url) {
      // Standard sitemap format
      result.urlset.url.forEach((entry: any) => {
        if (entry.loc && entry.loc[0]) {
          urls.push(entry.loc[0]);
        }
      });
      logger.debug(
        "Sitemap",
        `Found standard sitemap with ${urls.length} URLs`
      );
    } else if (result.sitemapindex && result.sitemapindex.sitemap) {
      // Sitemap index format - extract sitemap URLs
      result.sitemapindex.sitemap.forEach((entry: any) => {
        if (entry.loc && entry.loc[0]) {
          urls.push(entry.loc[0]);
        }
      });
      logger.debug(
        "Sitemap",
        `Found sitemap index with ${urls.length} sitemaps`
      );
    }

    logger.success("Sitemap", `Extracted ${urls.length} URLs from sitemap`);

    return {
      urls,
      totalCount: urls.length,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("Sitemap", "Error parsing sitemap", error);

    return {
      urls: [],
      totalCount: 0,
      error: errorMsg,
    };
  }
}

/**
 * Validate that a URL is valid and accessible
 */
export async function validateUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ICJIA-Accessibility-Scanner/1.0)",
      },
      redirect: "follow",
    });

    // Accept 2xx and 3xx status codes
    return response.status < 400;
  } catch (error) {
    console.log(`[Sitemap] URL validation failed for ${url}`);
    return false;
  }
}
