from django.core.management.base import BaseCommand
from datetime import time
from routine.models import Period


class Command(BaseCommand):

    def handle(self, *args, **kwargs):

        periods = [

            ("Period 1", time(10,0), time(10,50)),
            ("Period 2", time(10,50), time(11,35)),
            ("Period 3", time(11,35), time(12,20)),
            ("Period 4", time(12,20), time(13,5)),
            ("Lunch Break", time(13,5), time(13,50)),
            ("Period 5", time(13,50), time(14,30)),
            ("Period 6", time(14,30), time(15,10)),
            ("Period 7", time(15,10), time(15,50)),

        ]

        for name, start, end in periods:

            Period.objects.create(
                name=name,
                start_time=start,
                end_time=end
            )

        self.stdout.write("Periods created successfully")