const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get public profile of a user
 */
async function getUserProfile(req, res, next) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const currentUserId = req.user ? req.user.user_id : null;

    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.first_name, u.last_name, u.country, u.profile_image_url, u.joined_at,
              COUNT(DISTINCT uf_followers.follower_id) AS followers_count,
              COUNT(DISTINCT uf_following.followee_id) AS following_count,
              COUNT(DISTINCT p.playlist_no) AS public_playlists_count,
              CASE 
                WHEN ? IS NOT NULL THEN EXISTS(
                  SELECT 1 FROM user_follow WHERE follower_id = ? AND followee_id = u.user_id
                )
                ELSE FALSE
              END AS is_following
       FROM app_user u
       LEFT JOIN user_follow uf_followers ON u.user_id = uf_followers.followee_id
       LEFT JOIN user_follow uf_following ON u.user_id = uf_following.follower_id
       LEFT JOIN playlist p ON u.user_id = p.user_id
       WHERE u.user_id = ?
       GROUP BY u.user_id, u.username, u.first_name, u.last_name, u.country, u.profile_image_url, u.joined_at`,
      [currentUserId, currentUserId, targetUserId]
    );

    if (rows.length === 0) {
      return sendError(res, 'User not found.', 404);
    }

    return sendSuccess(res, { profile: rows[0] }, 'User profile retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Follow another user
 */
async function followUser(req, res, next) {
  try {
    const followerId = req.user.user_id;
    const followeeId = parseInt(req.params.id, 10);

    if (followerId === followeeId) {
      return sendError(res, 'You cannot follow yourself.', 400);
    }

    // Check if target user exists
    const [target] = await pool.query('SELECT user_id FROM app_user WHERE user_id = ?', [followeeId]);
    if (target.length === 0) {
      return sendError(res, 'Target user to follow not found.', 404);
    }

    // Insert follow relationship (Composite PK prevents duplicates)
    await pool.query(
      `INSERT INTO user_follow (follower_id, followee_id, followed_at)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE followed_at = VALUES(followed_at)`,
      [followerId, followeeId]
    );

    return sendSuccess(res, { following_id: followeeId }, 'Successfully followed user');
  } catch (err) {
    next(err);
  }
}

/**
 * Unfollow a user
 */
async function unfollowUser(req, res, next) {
  try {
    const followerId = req.user.user_id;
    const followeeId = parseInt(req.params.id, 10);

    const [result] = await pool.query(
      'DELETE FROM user_follow WHERE follower_id = ? AND followee_id = ?',
      [followerId, followeeId]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 'You are not following this user.', 400);
    }

    return sendSuccess(res, { unfollowed_id: followeeId }, 'Successfully unfollowed user');
  } catch (err) {
    next(err);
  }
}

/**
 * Get list of followers for a user
 */
async function getFollowers(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);

    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.first_name, u.last_name, u.profile_image_url, uf.followed_at
       FROM user_follow uf
       INNER JOIN app_user u ON uf.follower_id = u.user_id
       WHERE uf.followee_id = ?
       ORDER BY uf.followed_at DESC`,
      [userId]
    );

    return sendSuccess(res, { followers: rows, count: rows.length }, 'Followers retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get list of users followed by a user
 */
async function getFollowing(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);

    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.first_name, u.last_name, u.profile_image_url, uf.followed_at
       FROM user_follow uf
       INNER JOIN app_user u ON uf.followee_id = u.user_id
       WHERE uf.follower_id = ?
       ORDER BY uf.followed_at DESC`,
      [userId]
    );

    return sendSuccess(res, { following: rows, count: rows.length }, 'Following list retrieved successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
