const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { generateToken, sendSuccess, sendError } = require('../utils/response');

/**
 * Register a new user
 * Calls sp_register_user to maintain atomic supertype/subtype ISA specialization.
 */
async function register(req, res, next) {
  try {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      birth_date = null,
      country = null,
      account_type = 'free',
      daily_skip_limit = 6,
      plan_type = null,
      valid_months = 12,
    } = req.body;

    // Check unique username & email before proceeding
    const [existing] = await pool.query(
      'SELECT username, email FROM app_user WHERE username = ? OR email = ? LIMIT 1',
      [username, email]
    );

    if (existing.length > 0) {
      if (existing[0].username === username) {
        return sendError(res, 'Username already taken. Please choose another.', 409);
      }
      if (existing[0].email === email) {
        return sendError(res, 'Email address is already registered.', 409);
      }
    }

    // Hash password with bcrypt
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Call sp_register_user
    // Signature: (username, email, password_hash, first_name, last_name, birth_date, country, account_type, daily_skip_limit, plan_type, valid_months, OUT p_new_user_id)
    const sql = `CALL sp_register_user(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @new_user_id)`;
    const values = [
      username,
      email,
      password_hash,
      first_name,
      last_name,
      birth_date || null,
      country || null,
      account_type,
      account_type === 'free' ? daily_skip_limit : null,
      account_type === 'premium' ? (plan_type || 'basic') : null,
      account_type === 'premium' ? valid_months : null,
    ];

    await pool.query(sql, values);
    const [[outResult]] = await pool.query('SELECT @new_user_id AS new_user_id');
    const newUserId = outResult.new_user_id;

    // Generate JWT
    const token = generateToken({
      user_id: newUserId,
      username,
      email,
    });

    return sendSuccess(
      res,
      {
        user: {
          user_id: newUserId,
          username,
          email,
          first_name,
          last_name,
          account_type,
        },
        token,
      },
      'Registration successful',
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Log in an existing user
 */
async function login(req, res, next) {
  try {
    const { login, password } = req.body; // login can be username or email

    // Fetch user with password_hash
    const [users] = await pool.query(
      `SELECT u.user_id, u.username, u.email, u.password_hash, u.first_name, u.last_name,
              CASE 
                WHEN pu.user_id IS NOT NULL THEN 'premium'
                WHEN fu.user_id IS NOT NULL THEN 'free'
                ELSE 'unassigned'
              END AS account_type,
              pu.plan_type, pu.valid_till
       FROM app_user u
       LEFT JOIN free_user fu ON u.user_id = fu.user_id
       LEFT JOIN premium_user pu ON u.user_id = pu.user_id
       WHERE u.username = ? OR u.email = ?
       LIMIT 1`,
      [login, login]
    );

    if (users.length === 0) {
      return sendError(res, 'Invalid credentials. User not found.', 401);
    }

    const user = users[0];

    // Verify bcrypt password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials. Incorrect password.', 401);
    }

    // Generate JWT
    const token = generateToken({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
    });

    // Exclude password_hash from response
    delete user.password_hash;

    return sendSuccess(
      res,
      {
        user,
        token,
      },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Get current authenticated user profile
 */
async function getMe(req, res, next) {
  try {
    const userId = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.email, u.first_name, u.last_name,
              u.birth_date, u.country, u.profile_image_url, u.joined_at,
              fn_age(u.user_id) AS age,
              CASE 
                WHEN pu.user_id IS NOT NULL THEN 'premium'
                WHEN fu.user_id IS NOT NULL THEN 'free'
                ELSE 'unassigned'
              END AS account_type,
              fu.daily_skip_limit,
              pu.plan_type, pu.subscribed_on, pu.valid_till
       FROM app_user u
       LEFT JOIN free_user fu ON u.user_id = fu.user_id
       LEFT JOIN premium_user pu ON u.user_id = pu.user_id
       WHERE u.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return sendError(res, 'User profile not found.', 404);
    }

    return sendSuccess(res, { user: rows[0] }, 'Current user profile fetched successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Update authenticated user profile
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { first_name, last_name, country, profile_image_url, birth_date } = req.body;

    const updates = [];
    const values = [];

    if (first_name !== undefined) {
      updates.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push('last_name = ?');
      values.push(last_name);
    }
    if (country !== undefined) {
      updates.push('country = ?');
      values.push(country);
    }
    if (profile_image_url !== undefined) {
      updates.push('profile_image_url = ?');
      values.push(profile_image_url);
    }
    if (birth_date !== undefined) {
      updates.push('birth_date = ?');
      values.push(birth_date || null);
    }

    if (updates.length === 0) {
      return sendError(res, 'No update fields provided.', 400);
    }

    values.push(userId);
    await pool.query(
      `UPDATE app_user SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    // Fetch updated
    const [rows] = await pool.query(
      'SELECT user_id, username, email, first_name, last_name, birth_date, country, profile_image_url, fn_age(user_id) AS age FROM app_user WHERE user_id = ?',
      [userId]
    );

    return sendSuccess(res, { user: rows[0] }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Change authenticated user password
 */
async function changePassword(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { old_password, new_password } = req.body;

    const [rows] = await pool.query(
      'SELECT password_hash FROM app_user WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return sendError(res, 'User not found.', 404);
    }

    const isMatch = await bcrypt.compare(old_password, rows[0].password_hash);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 400);
    }

    const saltRounds = 12;
    const newHash = await bcrypt.hash(new_password, saltRounds);

    await pool.query('UPDATE app_user SET password_hash = ? WHERE user_id = ?', [newHash, userId]);

    return sendSuccess(res, {}, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Logout
 * In stateless JWT authentication, client-side token deletion is standard.
 */
function logout(req, res) {
  return sendSuccess(
    res,
    {},
    'Logged out successfully. Please remove the authentication token from client storage.'
  );
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
};
