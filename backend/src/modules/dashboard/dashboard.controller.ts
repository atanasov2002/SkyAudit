import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtCookieAuthGuard } from '../auth/guards/jwt-cookie-auth.guard';

@Controller('dashboard')
@UseGuards(JwtCookieAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getMain(@Req() req) {
    // Return general dashboard info (summary, charts)
    return this.dashboardService.getDashboardSummary(req.user.id);
  }

  @Get('profile')
  getProfile(@Req() req) {
    return this.dashboardService.getUserProfile(req.user.id);
  }

  @Get('aws-overview')
  getAwsOverview(@Req() req) {
    return this.dashboardService.getAwsOverview(req.user.id);
  }

  // Add more subroutes as needed
}
