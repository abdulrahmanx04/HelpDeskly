export const templates = {
    verification: (url: string) => ({
        subject: 'Verify your email address',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome</h2>
                <p>Thanks for signing up. Please verify your email address to get started.</p>
                <p>
                    <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
                        Verify Email
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">This link expires in 7 days.</p>
                <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
            </div>
        `
    }),
    
    reset: (url: string) => ({
        subject: 'Reset your password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
                <p>Hi</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p>
                    <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
                        Reset Password
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
        `
    }),

    invite: (url: string, tenantName: string, inviterName: string, role: string) => ({
        subject: `You're invited to join ${tenantName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>You've been invited!</h2>
                <p><strong>${inviterName}</strong> has invited you to join <strong>${tenantName}</strong> as a <strong>${role}</strong>.</p>
                <p>Click the button below to accept the invitation and create your account:</p>
                <p>
                    <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 5px;">
                        Accept Invitation
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">This invitation expires in 7 days.</p>
                <p style="color: #666; font-size: 14px;">If you weren't expecting this invitation, you can safely ignore this email.</p>
            </div>
        `
    })
}