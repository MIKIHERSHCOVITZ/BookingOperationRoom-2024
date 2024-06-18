from django.apps import AppConfig
from django.core.management import call_command


class RoomsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rooms'

    def ready(self):
        call_command('seed_rooms')
