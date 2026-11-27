import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

type PasswordResetEmail = {
  to: string;
  code: string;
  expiresInMinutes: number;
};

function emailUnavailable() {
  return new ServiceUnavailableException({
    statusCode: 503,
    code: 'EMAIL_UNAVAILABLE',
    message: 'The reset email could not be sent. Please try again.',
  });
}

/**
 * Transactional email, currently just the password-reset code.
 *
 * Resend is called over `fetch` rather than through the SDK: one POST with a
 * bearer token does not justify another dependency in the lockfile.
 *
 * Without `RESEND_API_KEY` the code is logged instead of mailed. That keeps the
 * flow testable locally, while production fails loudly (503) rather than
 * telling a user to check an inbox that will never receive anything.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string | undefined;
  private readonly from: string;
  private readonly isProduction: boolean;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('RESEND_API_KEY');
    this.from = config.getOrThrow<string>('RESET_EMAIL_FROM');
    this.isProduction = config.get<string>('NODE_ENV') === 'production';
  }

  async sendPasswordResetCode({
    to,
    code,
    expiresInMinutes,
  }: PasswordResetEmail): Promise<void> {
    if (!this.apiKey) {
      if (this.isProduction) {
        this.logger.error(
          'RESEND_API_KEY is not set, so the password reset email cannot be sent',
        );
        throw emailUnavailable();
      }

      // Development and tests: the terminal is the inbox.
      this.logger.warn(
        `Password reset code for ${to}: ${code} (expires in ${expiresInMinutes} min)`,
      );
      return;
    }

    let response: Response;
    try {
      response = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to: [to],
          subject: 'Your YinPhone admin password reset code',
          text: resetText(code, expiresInMinutes),
          html: resetHtml(code, expiresInMinutes),
        }),
      });
    } catch (error) {
      this.logger.error(
        `Resend request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw emailUnavailable();
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      this.logger.error(
        `Resend rejected the message (${response.status}): ${detail.slice(0, 500)}`,
      );
      throw emailUnavailable();
    }
  }
}

function resetText(code: string, expiresInMinutes: number) {
  return [
    'YinPhone Boutique admin — password reset',
    '',
    `Your 6-digit code is ${code}.`,
    `It expires in ${expiresInMinutes} minutes.`,
    '',
    'If you did not ask to reset your password, you can ignore this email.',
  ].join('\n');
}

function resetHtml(code: string, expiresInMinutes: number) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f4ef;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#1c1a17">
    <div style="max-width:440px;margin:0 auto;background:#ffffff;border:1px solid #e4e0d8;border-radius:12px;padding:24px">
      <p style="margin:0 0 4px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#8a8375">YinPhone Boutique</p>
      <h1 style="margin:0 0 12px;font-size:20px">Password reset code</h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6">Enter this code to choose a new admin password. It expires in ${expiresInMinutes} minutes.</p>
      <p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:.35em;padding:18px;text-align:center;background:#f6f4ef;border-radius:8px">${code}</p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#6b655a">If you did not ask to reset your password, you can ignore this email.</p>
    </div>
  </body>
</html>`;
}
