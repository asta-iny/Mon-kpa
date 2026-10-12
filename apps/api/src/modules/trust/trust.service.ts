import type { PrismaClient } from '@prisma/client';
import type {
  CreateVerificationInput,
  UpdateVerificationInput,
  VerificationQuery,
  CreateReportInput,
  UpdateReportInput,
  ReportQuery,
  CreateModerationActionInput,
  ModerationActionQuery,
} from '@libfind/validation';

export class TrustService {
  private readonly repo: TrustRepository;

  constructor(prisma: PrismaClient) {
    this.repo = new TrustRepository(prisma);
  }

  // --- Fraud Intelligence ---

  /** Anomaly score for a subject (0-100, higher = more suspicious) */
  async calculateAnomalyScore(subjectType: string, subjectId: string) {
    // Get verification history
    const verifications = await this.repo.findVerificationsBySubject(subjectType, subjectId);

    // Get report count
    const reportCount = await this.repo.repo.countReportsBySubject(subjectType, subjectId);

    // Get moderation action count
    const moderationCount = await this.repo.countModerationActionsBySubject(subjectType, subjectId);

    // Base score from verification patterns
    let score = 0;

    // Pattern: multiple failed verifications
    const failedVerifications = verifications.filter((v) => v.status !== 'approved').length;
    if (failedVerifications >= 3) {
      score += 30;
    }
    if (failedVerifications >= 5) {
      score += 20; // cumulative
    }

    // Pattern: multiple reports
    if (reportCount >= 3) {
      score += 30;
    }
    if (reportCount >= 5) {
      score += 20; // cumulative
    }

    // Pattern: multiple moderation actions
    if (moderationCount >= 3) {
      score += 25;
    }
    if (moderationCount >= 5) {
      score += 15; // cumulative
    }

    // Cap at 100
    return Math.min(100, score);
  }

  /** Flag a subject as suspicious */
  async flagSuspicious(subjectType: string, subjectId: string, reason: string, flaggedBy: string) {
    // Create a moderation action flagging the subject
    await this.repo.createModerationAction({
      targetType: subjectType,
      targetId: subjectId,
      action: 'flag',
      reason,
      reporterId: flaggedBy,
    });

    // Update anomaly score
    const score = await this.calculateAnomalyScore(subjectType, subjectId);

    return {
      subjectType,
      subjectId,
      flagged: true,
      anomalyScore: score,
      reason,
      flaggedAt: new Date(),
    };
  }

  /** Get fraud risk assessment for a subject */
  async getFraudRisk(subjectType: string, subjectId: string) {
    const anomalyScore = await this.calculateAnomalyScore(subjectType, subjectId);
    const recentReports = await this.repo.repo.getReportsBySubject(subjectType, subjectId, {
      status: 'open',
    });

    return {
      subjectType,
      subjectId,
      anomalyScore,
      riskLevel: this._getRiskLevel(anomalyScore),
      openReports: recentReports.length,
      recommendedAction: this._getRecommendedAction(anomalyScore, recentReports.length),
    };
  }

  /** Get flagged subjects for review */
  async getFlaggedSubjects(subjectType?: string, limit: number = 50) {
    return this.repo.repo.findFlaggedSubjects(subjectType, limit);
  }

  /** Moderation action types for fraud */
  getModerationActionTypes() {
    return [
      { value: 'flag', label: 'Flag as suspicious' },
      { value: 'warning', label: 'Issue warning' },
      { value: 'suspension', label: 'Suspend account' },
      { value: 'ban', label: 'Permanent ban' },
      { value: 'verified', label: 'Mark as verified' },
    ];
  }

  /** Get fraud patterns reference */
  getFraudPatterns() {
    return [
      {
        pattern: 'multiple_failures',
        description: 'Multiple failed verifications or reports',
        threshold: 3,
        severity: 'high',
      },
      {
        pattern: 'report_clustering',
        description: 'Multiple reports against same subject in short period',
        threshold: 3,
        severity: 'high',
      },
      {
        pattern: 'moderation_chain',
        description: 'Multiple moderation actions against same subject',
        threshold: 3,
        severity: 'medium',
      },
      {
        pattern: 'unusual_activity',
        description: 'Unusual activity patterns (timing, volume)',
        threshold: undefined,
        severity: 'medium',
      },
    ];
  }

  /** Helper: map anomaly score to risk level */
  _getRiskLevel(score: number) {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    if (score > 0) return 'low';
    return 'none';
  }

  /** Helper: map anomaly score to recommended action */
  _getRecommendedAction(score: number, openReports: number) {
    if (score >= 70 || openReports >= 3) return 'suspend';
    if (score >= 50 || openReports >= 2) return 'flag_for_review';
    if (score > 0 || openReports >= 1) return 'monitor';
    return 'no_action';
  }
}