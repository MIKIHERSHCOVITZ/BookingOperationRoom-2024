from django.urls import path
from . import views

# all relevant urls for rooms app
urlpatterns = [
    path('rooms', views.get_rooms, name='get_rooms'),
    path('room_schedule', views.get_room_schedule, name='get_room_schedule'),
    path('book_room', views.book_room, name='book_room'),
    path('cancel_booking', views.cancel_booking, name='cancel_booking'),
    path('add_room', views.add_room, name='add_room'),
    path('delete_room', views.delete_room, name='delete_room'),
]
