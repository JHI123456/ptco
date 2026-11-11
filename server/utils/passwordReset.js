import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_COOLDOWN_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

/**
 * Computes a SHA-256 hex digest matching TurismoTrack credential hashing.
 */
export function hashSha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function timingSafeHexEqual(hexA, hexB) {
  if (!hexA || !hexB || typeof hexA !== 'string' || typeof hexB !== 'string') return false;
  const bufA = Buffer.from(hexA, 'utf8');
  const bufB = Buffer.from(hexB, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Builds a configured Nodemailer transporter from SMTP/Gmail env variables.
 * Returns null if credentials have not been configured on the server.
 */
export function getSmtpConfig() {
  const user = (
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    process.env.GMAIL_USER ||
    ''
  ).trim();
  const pass = (
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS ||
    process.env.GMAIL_APP_PASSWORD ||
    ''
  ).replace(/\s+/g, '');

  if (!user || !pass) return null;

  const host = (process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const from = (process.env.SMTP_FROM || `TurismoTrack <${user}>`).trim();

  const transportOptions = host
    ? {
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      }
    : {
        service: 'gmail',
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      };

  return {
    from,
    transporter: nodemailer.createTransport(transportOptions),
  };
}

/**
 * Sends a 6-digit password reset OTP email to the registered account holder.
 */
export async function sendResetOtpEmail(smtp, { toEmail, displayName, otp }) {
  const safeName = escapeHtml(displayName || 'TurismoTrack User');
  const safeOtp = escapeHtml(otp);

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #FAF6EC; padding: 28px; border-radius: 12px; border: 1px solid #E5DEC9;">
      <div style="background: #161616; padding: 16px 20px; border-radius: 8px; margin-bottom: 22px;">
        <span style="color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: 0.6px;">TURISMO<span style="color: #E07B39;">TRACK</span></span>
        <span style="display: block; color: #cbd5e1; font-size: 11px; margin-top: 2px;">Provincial Tourism &amp; Culture Office • Nueva Vizcaya</span>
      </div>
      <h2 style="margin: 0 0 10px 0; color: #2d2a26; font-size: 19px;">Password Reset Verification Code</h2>
      <p style="margin: 0 0 16px 0; color: #554e44; font-size: 14px; line-height: 1.5;">
        Hello <strong>${safeName}</strong>,<br/>
        We received a request to reset the password for your TurismoTrack account. Enter the 6-digit verification code below:
      </p>
      <div style="background: #EDF5F9; border: 1px solid #D2E3EF; border-radius: 10px; padding: 18px; text-align: center; margin: 18px 0;">
        <span style="font-size: 30px; font-weight: 800; letter-spacing: 8px; color: #E07B39;">${safeOtp}</span>
      </div>
      <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px; line-height: 1.5;">
        This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.
      </p>
      <p style="margin: 0; color: #8a8378; font-size: 12px;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  const text = [
    'TurismoTrack — Password Reset Verification Code',
    '',
    `Hello ${displayName || 'TurismoTrack User'},`,
    `Your 6-digit verification code is: ${otp}`,
    '',
    'This code expires in 10 minutes. Do not share this code with anyone.',
    'If you did not request a password reset, you can safely ignore this email.',
  ].join('\n');

  await smtp.transporter.sendMail({
    from: smtp.from,
    to: toEmail,
    subject: 'TurismoTrack — Password Reset Verification Code',
    text,
    html,
  });
}

/**
 * Registers POST /forgot-password, /verify-reset-otp,
 * and /reset-password handlers on any Express app or router.
 */
export function registerPasswordResetRoutes(
  target,
  { findUserByEmail, updateUserById, logAudit, extractClientIp, getSmtp = getSmtpConfig }
) {
  async function handleOtpCheck(user, otp) {
    if (!user.resetOtpHash || !user.resetOtpExpiresAt) {
      return { ok: false, status: 400, error: 'No active verification code found. Please request a new code.' };
    }

    if (new Date(user.resetOtpExpiresAt).getTime() < Date.now()) {
      await updateUserById(user._id, {
        resetOtpHash: null,
        resetOtpExpiresAt: null,
        resetOtpAttempts: 0,
      });
      return { ok: false, status: 400, error: 'Verification code has expired. Please request a new code.' };
    }

    const attempts = Number(user.resetOtpAttempts || 0);
    if (attempts >= OTP_MAX_ATTEMPTS) {
      await updateUserById(user._id, {
        resetOtpHash: null,
        resetOtpExpiresAt: null,
        resetOtpAttempts: 0,
      });
      return { ok: false, status: 429, error: 'Too many invalid attempts. Please request a new verification code.' };
    }

    const cleanOtp = String(otp || '').trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      return { ok: false, status: 400, error: 'Please enter a valid 6-digit verification code.' };
    }

    const submittedHash = hashSha256(cleanOtp);
    if (!timingSafeHexEqual(submittedHash, user.resetOtpHash)) {
      const nextAttempts = attempts + 1;
      const exhausted = nextAttempts >= OTP_MAX_ATTEMPTS;
      await updateUserById(
        user._id,
        exhausted
          ? { resetOtpHash: null, resetOtpExpiresAt: null, resetOtpAttempts: 0 }
          : { resetOtpAttempts: nextAttempts }
      );
      return {
        ok: false,
        status: exhausted ? 429 : 400,
        error: exhausted
          ? 'Too many invalid attempts. Please request a new verification code.'
          : `Incorrect verification code. ${OTP_MAX_ATTEMPTS - nextAttempts} attempt(s) remaining.`,
      };
    }

    return { ok: true };
  }

  target.post('/forgot-password', async (req, res) => {
    try {
      const cleanEmail = String(req.body?.email || '').trim().toLowerCase();
      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        return res.status(400).json({ error: 'Please enter a valid registered email address.' });
      }

      const smtp = getSmtp();
      if (!smtp) {
        return res.status(503).json({
          error: 'Email service is not configured yet on the server. Please configure SMTP_USER and SMTP_PASS (Gmail App Password) in the backend environment.',
        });
      }

      const user = await findUserByEmail(cleanEmail);
      if (!user) {
        return res.status(404).json({
          error: 'No registered account found with that email address.',
        });
      }

      if (user.resetOtpRequestedAt) {
        const elapsedMs = Date.now() - new Date(user.resetOtpRequestedAt).getTime();
        if (elapsedMs < OTP_COOLDOWN_MS) {
          const retryAfterSeconds = Math.ceil((OTP_COOLDOWN_MS - elapsedMs) / 1000);
          return res.status(429).json({
            error: `Please wait ${retryAfterSeconds}s before requesting another verification code.`,
            retryAfterSeconds,
          });
        }
      }

      const otp = crypto.randomInt(100000, 1000000).toString();
      const otpHash = hashSha256(otp);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + OTP_TTL_MS);

      await updateUserById(user._id, {
        resetOtpHash: otpHash,
        resetOtpExpiresAt: expiresAt,
        resetOtpAttempts: 0,
        resetOtpRequestedAt: now,
      });

      const displayName = user.officeName || user.establishmentName || user.name || cleanEmail;

      try {
        await sendResetOtpEmail(smtp, {
          toEmail: cleanEmail,
          displayName,
          otp,
        });
      } catch (mailErr) {
        await updateUserById(user._id, {
          resetOtpHash: null,
          resetOtpExpiresAt: null,
          resetOtpAttempts: 0,
          resetOtpRequestedAt: null,
        });
        console.error('[ForgotPassword Email Error]:', mailErr.message);

        await logAudit?.({
          user: { _id: user._id, email: cleanEmail, name: displayName, role: user.role, municipality: user.municipality },
          action: 'PASSWORD_RESET_REQUEST',
          module: 'Authentication',
          details: `Failed to deliver password reset OTP to ${cleanEmail}`,
          status: 'Failed',
          ipAddress: extractClientIp?.(req),
        });

        return res.status(500).json({
          error: 'Unable to send verification email right now. Please verify SMTP settings or try again later.',
        });
      }

      await logAudit?.({
        user: { _id: user._id, email: cleanEmail, name: displayName, role: user.role, municipality: user.municipality },
        action: 'PASSWORD_RESET_REQUEST',
        module: 'Authentication',
        details: `Sent password reset verification code to ${cleanEmail}`,
        status: 'Success',
        ipAddress: extractClientIp?.(req),
      });

      return res.json({
        success: true,
        message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
        expiresInMinutes: 10,
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({ error: error.message || 'Server error while requesting password reset.' });
    }
  });

  target.post('/verify-reset-otp', async (req, res) => {
    try {
      const cleanEmail = String(req.body?.email || '').trim().toLowerCase();
      const cleanOtp = String(req.body?.otp || '').trim();

      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      const user = await findUserByEmail(cleanEmail);
      if (!user) {
        return res.status(404).json({ error: 'No registered account found with that email address.' });
      }

      const check = await handleOtpCheck(user, cleanOtp);
      if (!check.ok) {
        return res.status(check.status).json({ error: check.error });
      }

      return res.json({
        success: true,
        message: 'Verification code confirmed. You may now set a new password.',
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Server error while verifying code.' });
    }
  });

  target.post('/reset-password', async (req, res) => {
    try {
      const cleanEmail = String(req.body?.email || '').trim().toLowerCase();
      const cleanOtp = String(req.body?.otp || '').trim();
      const newPassword = String(req.body?.newPassword || '');

      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      if (!PASSWORD_REGEX.test(newPassword)) {
        return res.status(400).json({
          error: 'Password must be at least 8 characters, including a letter and a number.',
        });
      }

      const user = await findUserByEmail(cleanEmail);
      if (!user) {
        return res.status(404).json({ error: 'No registered account found with that email address.' });
      }

      const check = await handleOtpCheck(user, cleanOtp);
      if (!check.ok) {
        return res.status(check.status).json({ error: check.error });
      }

      const hashedPassword = hashSha256(newPassword);
      await updateUserById(user._id, {
        password: hashedPassword,
        resetOtpHash: null,
        resetOtpExpiresAt: null,
        resetOtpAttempts: 0,
        resetOtpRequestedAt: null,
        updatedAt: new Date(),
      });

      const displayName = user.officeName || user.establishmentName || user.name || cleanEmail;
      await logAudit?.({
        user: { _id: user._id, email: cleanEmail, name: displayName, role: user.role, municipality: user.municipality },
        action: 'PASSWORD_RESET',
        module: 'Authentication',
        details: `Password reset completed successfully for ${cleanEmail}`,
        status: 'Success',
        ipAddress: extractClientIp?.(req),
      });

      return res.json({
        success: true,
        message: 'Password updated successfully! You can now sign in with your new password.',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ error: error.message || 'Server error while resetting password.' });
    }
  });
}
