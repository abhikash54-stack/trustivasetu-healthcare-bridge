-- Drop the old single-column index on OtpToken.email
DROP INDEX IF EXISTS "OtpToken_email_idx";

-- Add a compound index on (email, purpose) for faster OTP lookups
CREATE INDEX "OtpToken_email_purpose_idx" ON "OtpToken"("email", "purpose");
