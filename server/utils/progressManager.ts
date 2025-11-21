/**
 * Progress Manager - Handles saving and loading scan progress
 */

import { supabase } from "./supabase.js";

export interface ScanProgress {
  scanId: string;
  pageIndex: number;
  pagesScanned: number;
  totalViolations: number;
  worstPageUrl: string;
  worstPageViolationCount: number;
  worstPageViolations: any[];
  lastSavedAt: string;
}

/**
 * Save scan progress to database
 */
export async function saveProgress(
  scanId: string,
  pageIndex: number,
  pagesScanned: number,
  totalViolations: number,
  worstPageUrl: string,
  worstPageViolationCount: number,
  worstPageViolations: any[]
): Promise<void> {
  try {
    console.log(
      `[ProgressManager] Saving progress for scan ${scanId}: page ${pageIndex}, pages scanned: ${pagesScanned}`
    );

    const { error } = await supabase
      .from("scans")
      .update({
        last_scanned_page_index: pageIndex,
        pages_scanned: pagesScanned,
        total_violations_sum: totalViolations,
        worst_page_url: worstPageUrl,
        worst_page_violation_count: worstPageViolationCount,
        worst_page_violations: worstPageViolations,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scanId);

    if (error) {
      console.error(
        `[ProgressManager] Error saving progress: ${error.message}`
      );
      throw error;
    }

    console.log(`[ProgressManager] Progress saved successfully`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[ProgressManager] Failed to save progress: ${errorMsg}`);
    throw error;
  }
}

/**
 * Load scan progress from database
 */
export async function loadProgress(scanId: string): Promise<ScanProgress | null> {
  try {
    console.log(`[ProgressManager] Loading progress for scan ${scanId}`);

    const { data, error } = await supabase
      .from("scans")
      .select(
        "id, last_scanned_page_index, pages_scanned, total_violations_sum, worst_page_url, worst_page_violation_count, worst_page_violations, updated_at"
      )
      .eq("id", scanId)
      .single();

    if (error) {
      console.error(
        `[ProgressManager] Error loading progress: ${error.message}`
      );
      return null;
    }

    if (!data) {
      console.log(`[ProgressManager] No progress found for scan ${scanId}`);
      return null;
    }

    const progress: ScanProgress = {
      scanId: data.id,
      pageIndex: data.last_scanned_page_index || 0,
      pagesScanned: data.pages_scanned || 0,
      totalViolations: data.total_violations_sum || 0,
      worstPageUrl: data.worst_page_url || "",
      worstPageViolationCount: data.worst_page_violation_count || 0,
      worstPageViolations: data.worst_page_violations || [],
      lastSavedAt: data.updated_at,
    };

    console.log(
      `[ProgressManager] Progress loaded: page index ${progress.pageIndex}, pages scanned ${progress.pagesScanned}`
    );

    return progress;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[ProgressManager] Failed to load progress: ${errorMsg}`);
    return null;
  }
}

/**
 * Clear scan progress
 */
export async function clearProgress(scanId: string): Promise<void> {
  try {
    console.log(`[ProgressManager] Clearing progress for scan ${scanId}`);

    const { error } = await supabase
      .from("scans")
      .update({
        last_scanned_page_index: 0,
        pages_scanned: 0,
        total_violations_sum: 0,
        worst_page_url: null,
        worst_page_violation_count: 0,
        worst_page_violations: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scanId);

    if (error) {
      console.error(
        `[ProgressManager] Error clearing progress: ${error.message}`
      );
      throw error;
    }

    console.log(`[ProgressManager] Progress cleared successfully`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[ProgressManager] Failed to clear progress: ${errorMsg}`);
    throw error;
  }
}

