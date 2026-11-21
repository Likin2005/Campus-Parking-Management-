from app.repositories.booking_repository import booking_repo
from app.repositories.zone_repository import zone_repo
from app.schemas.dashboard import DashboardStatsResponse, HourlyTrendPoint


class DashboardService:
    async def get_campus_stats(self) -> DashboardStatsResponse:
        zones = await zone_repo.get_all()

        total_zones = len(zones)
        total_slots = sum(len(z.slots) for z in zones)
        total_available = sum(sum(1 for s in z.slots if s.status == "available") for z in zones)
        total_occupied = sum(sum(1 for s in z.slots if s.status == "occupied") for z in zones)
        total_reserved = sum(sum(1 for s in z.slots if s.status == "reserved") for z in zones)
        total_disabled = sum(sum(1 for s in z.slots if s.status == "disabled") for z in zones)
        total_ev = sum(
            sum(1 for s in z.slots if s.type == "EV Charging" and s.status == "available") for z in zones
        )

        engaged = total_occupied + total_reserved
        occupancy_rate = round((engaged / total_slots) * 100) if total_slots > 0 else 0

        # Hourly occupancy curve (8 AM - 8 PM)
        hourly_data = [
            HourlyTrendPoint(hour="8 AM", pct=25),
            HourlyTrendPoint(hour="9 AM", pct=55),
            HourlyTrendPoint(hour="10 AM", pct=82),
            HourlyTrendPoint(hour="11 AM", pct=94),
            HourlyTrendPoint(hour="12 PM", pct=90),
            HourlyTrendPoint(hour="1 PM", pct=88),
            HourlyTrendPoint(hour="2 PM", pct=92),
            HourlyTrendPoint(hour="3 PM", pct=75),
            HourlyTrendPoint(hour="4 PM", pct=60),
            HourlyTrendPoint(hour="5 PM", pct=40),
            HourlyTrendPoint(hour="6 PM", pct=28),
            HourlyTrendPoint(hour="7 PM", pct=18),
        ]

        return DashboardStatsResponse(
            totalZones=total_zones,
            totalSlots=total_slots,
            totalAvailable=total_available,
            totalOccupied=total_occupied,
            totalReserved=total_reserved,
            totalDisabled=total_disabled,
            totalEv=total_ev,
            occupancyRate=occupancy_rate,
            hourlyData=hourly_data,
        )


dashboard_service = DashboardService()
