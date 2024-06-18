from django.db import models


# model Room for all room's names
class Room(models.Model):
    name = models.CharField(max_length=100)


# model Booking for every room, different possible schedules
class Booking(models.Model):
    room = models.ForeignKey(Room, related_name='bookings', on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()




# TODO check unit tests
# TODO add picture to readme
# TODO change in readme to my url
# TODO delete db
