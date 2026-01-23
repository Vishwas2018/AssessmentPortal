/**
 * Route Utility Functions
 * Provides type-safe route generation with parameter substitution
 */

import { ROUTES } from "@/data/constants";

/**
 * Generate exam start route
 * @param examId - The exam ID
 * @returns Route string like "/exam/abc123/start"
 */
export function getExamStartRoute(examId: string): string {
  return ROUTES.EXAM_START.replace(":examId", examId);
}

/**
 * Generate exam take route
 * @param examId - The exam ID
 * @param attemptId - The attempt ID
 * @returns Route string like "/exam/abc123/take/def456"
 */
export function getExamTakeRoute(examId: string, attemptId: string): string {
  return ROUTES.EXAM_TAKE.replace(":examId", examId).replace(
    ":attemptId",
    attemptId,
  );
}

/**
 * Generate exam results route
 * @param examId - The exam ID
 * @param attemptId - The attempt ID
 * @returns Route string like "/exam/abc123/results/def456"
 */
export function getExamResultsRoute(examId: string, attemptId: string): string {
  return ROUTES.EXAM_RESULTS.replace(":examId", examId).replace(
    ":attemptId",
    attemptId,
  );
}

/**
 * Type-safe route parameters
 */
export type ExamRouteParams = {
  examId: string;
};

export type ExamAttemptRouteParams = {
  examId: string;
  attemptId: string;
};

/**
 * Validate exam ID format (UUIDs)
 */
export function isValidExamId(examId: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(examId);
}

/**
 * Validate attempt ID format (UUIDs)
 */
export function isValidAttemptId(attemptId: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(attemptId);
}
