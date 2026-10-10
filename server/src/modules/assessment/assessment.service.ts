import { Types } from "mongoose";
import { AssessmentTemplateModel } from "./assessmentTemplate.model";
import { AssessmentResultModel } from "./assessmentResult.model";
import { UserModel } from "@/modules/user/user.model";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { SubmitAssessmentRequest, AssessmentResultResponse } from "./assessment.types";
import { crisisService } from "@/modules/crisis/crisis.service";
import { IAssessmentScoringRange } from "./assessmentTemplate.model";

export class AssessmentService {
  async getTemplate(
    templateType: "anxiety" | "stress" | "depression"
  ) {
    // First, try to find existing template
    let template = await AssessmentTemplateModel.findOne({ type: templateType });

    // If not found, create a sample one (for testing purposes)
    if (!template) {
      template = await AssessmentTemplateModel.create(this.getSampleTemplate(templateType));
    }

    return {
      ...template.toObject(),
      id: template._id.toString(),
      templateId: template._id.toString(),
    };
  }

  async submitAssessment(
    userId: string,
    data: SubmitAssessmentRequest
  ): Promise<AssessmentResultResponse> {
    const template = await this.getTemplate(data.templateType);

    // Validate answers match questions
    if (data.answers.length !== template.questions.length) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR,
        "Please answer all questions"
      );
    }

    // Calculate total score
    let totalScore = 0;
    let hasHighRiskAnswer = false;

    for (const answer of data.answers) {
      const question = template.questions.find(q => q.id === answer.questionId);
      if (!question) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          ErrorCodes.VALIDATION_ERROR,
          `Invalid question ID: ${answer.questionId}`
        );
      }

      const option = question.options.find(o => o.score === answer.selectedScore);
      if (!option) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          ErrorCodes.VALIDATION_ERROR,
          `Invalid score for question ${answer.questionId}`
        );
      }

      totalScore += answer.selectedScore;
      if (question.isHighRiskIndicator && answer.selectedScore >= 3) {
        hasHighRiskAnswer = true;
      }
    }

    // Determine result label and risk level
    const scoringRange = template.scoringRanges.find(
      r => totalScore >= r.min && totalScore <= r.max
    );

    if (!scoringRange) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ErrorCodes.INTERNAL_ERROR,
        "Could not determine result"
      );
    }

    const isHighRisk = ["high", "severe"].includes(scoringRange.riskLevel);
    const triggeredCrisisFlow = isHighRisk || hasHighRiskAnswer;

    // Create result
    const result = await AssessmentResultModel.create({
      userId: new Types.ObjectId(userId),
      templateId: template._id,
      templateType: data.templateType,
      answers: data.answers,
      totalScore,
      resultLabel: scoringRange.label,
      riskLevel: scoringRange.riskLevel,
      triggeredCrisisFlow,
    });

    // Get crisis resources if needed
    let crisisResources = undefined;
    if (triggeredCrisisFlow) {
      const user = await UserModel.findById(userId);
      crisisResources = await crisisService.getResources({
        jurisdiction: user?.country || "India",
      });
    }

    return {
      id: result._id.toString(),
      templateType: result.templateType,
      totalScore: result.totalScore,
      resultLabel: result.resultLabel,
      riskLevel: result.riskLevel,
      triggeredCrisisFlow: result.triggeredCrisisFlow,
      crisisResources,
      createdAt: result.createdAt.toISOString(),
    };
  }

  async getUserHistory(userId: string) {
    const results = await AssessmentResultModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });

    return results.map(r => ({
      id: r._id.toString(),
      templateType: r.templateType,
      totalScore: r.totalScore,
      resultLabel: r.resultLabel,
      riskLevel: r.riskLevel,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  private getSampleTemplate(type: "anxiety" | "stress" | "depression") {
    const commonQuestions = [
      {
        id: "q1",
        text: "How often have you felt nervous, anxious, or on edge?",
        options: [
          { text: "Not at all", score: 0 },
          { text: "Several days", score: 1 },
          { text: "More than half the days", score: 2 },
          { text: "Nearly every day", score: 3 },
        ],
        isHighRiskIndicator: true,
      },
      {
        id: "q2",
        text: "How often have you not been able to stop or control worrying?",
        options: [
          { text: "Not at all", score: 0 },
          { text: "Several days", score: 1 },
          { text: "More than half the days", score: 2 },
          { text: "Nearly every day", score: 3 },
        ],
        isHighRiskIndicator: true,
      },
    ];

    const scoringRanges: IAssessmentScoringRange[] = [
      { min: 0, max: 2, label: "Minimal", riskLevel: "low" },
      { min: 3, max: 4, label: "Mild", riskLevel: "moderate" },
      { min: 5, max: 6, label: "Moderate", riskLevel: "high" },
    ];

    return {
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Assessment`,
      questions: commonQuestions,
      scoringRanges,
    };
  }
}

export const assessmentService = new AssessmentService();
