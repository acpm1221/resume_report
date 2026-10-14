const { PDFParse } = require("pdf-parse");
const { generateReport } = require("../services/Ai.service");
const InterViewReport = require("../models/interviewReport.model");

async function interviewGenerateController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume file is required" });
        }

        const { selfDescription, jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({ message: "jobDescription is required" });
        }

        let resumeContent = "";
        if (req.file.mimetype === "application/pdf" || req.file.originalname?.endsWith(".pdf")) {
            const parser = new PDFParse({ data: req.file.buffer });
            const parsed = await parser.getText();
            resumeContent = parsed.text;
        } else {
            resumeContent = req.file.buffer.toString("utf-8");
        }

        const report = await generateReport({
            resume: resumeContent,
            jobDescription,
            selfDescription
        });

        const matchScore = typeof report.matchScore === "number" ? report.matchScore : (report.match_score || 50);
        const technicalQuestions = report.technicalQuestions || report.technicalQuestion || [];
        const behaviouralQuestions = report.behaviouralQuestions || report.behaviouralQuestion || [];
        const skillGap = report.skillGap || [];
        const preparationPlan = report.preparationPlan || [];

        const interviewReport = await InterViewReport.create({
            user: req.user.id,
            resume: resumeContent,
            selfDescription,
            jobDescription,
            matchScore,
            technicalQuestions,
            behaviouralQuestions,
            skillGap,
            preparationPlan
        });

        return res.status(201).json({
            message: "report generated successfully",
            data: interviewReport
        });
    } catch (error) {
        console.error("Error generating interview report:", error);
        return res.status(500).json({
            message: "Internal server error while generating report",
            error: error.message
        });
    }
}

module.exports = {
    interviewGenerateController
};
