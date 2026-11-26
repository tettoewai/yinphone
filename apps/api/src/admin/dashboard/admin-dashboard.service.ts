import { Injectable, NotImplementedException } from '@nestjs/common';

/** Setup stub: the route and guards are wired; the stats query lands later. */
@Injectable()
export class AdminDashboardService {
  overview() {
    throw new NotImplementedException(
      'Admin dashboard stats are not built yet',
    );
  }
}
