const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportSchema = {
    type: "object",
    properties: {
        matchScore: {
            type: "number",
            description: "Match score between the resume and job description from 0 to 100"
        },
        technicalQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string", description: "The technical question that can be asked" },
                    intention: { type: "string", description: "The intention behind asking the question" },
                    answer: { type: "string", description: "How to answer this question with key points and approach" }
                },
                required: ["question", "intention", "answer"]
            },
            description: "List of technical interview questions"
        },
        behaviouralQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string", description: "The behavioural question that can be asked" },
                    intention: { type: "string", description: "The intention behind asking the question" },
                    answer: { type: "string", description: "How to answer this question using the STAR method" }
                },
                required: ["question", "intention", "answer"]
            },
            description: "List of behavioural interview questions"
        },
        skillGap: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    skill: { type: "string", description: "The skill that is missing or needs development" },
                    severity: { type: "string", enum: ["low", "medium", "high"], description: "Severity of the skill gap" }
                },
                required: ["skill", "severity"]
            },
            description: "List of identified skill gaps"
        },
        preparationPlan: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    day: { type: "number", description: "Day number" },
                    focus: { type: "string", description: "Focus area for the day" },
                    task: { type: "string", description: "Specific tasks to be done on this day" }
                },
                required: ["day", "focus", "task"]
            },
            description: "Step-by-step interview preparation plan"
        }
    },
    required: ["matchScore", "technicalQuestions", "behaviouralQuestions", "skillGap", "preparationPlan"]
};

async function invokeGenAi(resumeOrObj, jobDescription, selfDescription) {
    let resume = resumeOrObj;
    let jobDesc = jobDescription;
    let selfDesc = selfDescription;

    if (typeof resumeOrObj === "object" && resumeOrObj !== null && !jobDescription) {
        resume = resumeOrObj.resume;
        jobDesc = resumeOrObj.jobDescription;
        selfDesc = resumeOrObj.selfDescription;
    }

    const prmt = `generate report from given job description and resume 
     Resume: ${resume || ""}
    Job Description: ${jobDesc || ""}
    Self Description: ${selfDesc || ""}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prmt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportSchema
        }
    });

    return JSON.parse(response.text);
}

module.exports = invokeGenAi;
module.exports.invokeGenAi = invokeGenAi;
module.exports.generateReport = invokeGenAi;
