import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module.js';
import { AdminAuthGuard } from './admin-auth.guard.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PasswordResetService } from './password-reset.service.js';
import { RolesGuard } from './roles.guard.js';

@Module({
  imports: [EmailModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordResetService, AdminAuthGuard, RolesGuard],
  exports: [AuthService, AdminAuthGuard, RolesGuard],
})
export class AuthModule {}
