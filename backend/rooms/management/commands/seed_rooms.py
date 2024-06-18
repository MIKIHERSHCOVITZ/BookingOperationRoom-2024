from django.core.management.base import BaseCommand
from rooms.models import Room


class Command(BaseCommand):
    # The function will create 5 rooms (1 to 5) when the project starts
    # I did it to allow you to try some existing rooms
    # If it doesn't work for reason you can add/delete rooms from the app itself.
    # You can run it also with - python manage.py seed_rooms
    def handle(self, *args, **kwargs):
        for i in range(1, 6):
            room_name = str(i)
            room, created = Room.objects.get_or_create(name=room_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created room {room_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Room {room_name} already exists'))
