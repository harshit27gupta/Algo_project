import Submission from '../models/Submission.js';

// GET /api/v1/problems/:id/recent-submissions
export const getRecentSubmissions = async (req, res) => {
  const { id: problemId } = req.params;
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 100;

  console.log(`[RecentSubmissionsAPI] Called for user: ${userId}, problem: ${problemId}, limit: ${limit}`);

  const submissions = await Submission.find({
    user: userId,
    problem: problemId
  })
    .sort({ submittedAt: -1 })
    .limit(limit);

  res.json({ success: true, data: submissions });
}; 