
import json
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Room, Booking


class RoomBookingAPITests(TestCase):
    # setup for unit tests
    # I created 2 rooms and schedule an hour for room_1
    def setUp(self):
        self.client = APIClient()
        self.room1 = Room.objects.create(name="Room 1")
        self.room2 = Room.objects.create(name="Room 2")
        self.booking = Booking.objects.create(room=self.room1, date="2024-06-15", time="08:00")

    # Test that take the existing rooms - suppose to have length of 2 and status 200
    def test_get_rooms(self):
        response = self.client.get('/api/rooms')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    # Test that get the schedule we added for room_1 and compare it to the expected
    def test_get_room_schedule(self):
        response = self.client.get(f'/api/room_schedule?room_id={self.room1.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['date'], "2024-06-15")
        self.assertEqual(response.data[0]['time'], "08:00:00")

    # Test that check if we get 404 in case we try to get a schedule for none existing room
    def test_get_room_schedule_not_found(self):
        response = self.client.get('/api/room_schedule?room_id=999')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Test that tries to book a specific room (room_2) and check it has one schedule
    def test_book_room_specific(self):
        response = self.client.post('/api/book_room', json.dumps({'date': "2024-06-15", 'time': "09:00", 'room_id': self.room2.id}), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Booking.objects.filter(room=self.room2).count(), 1)

    # Test that tries to book a random room
    def test_book_room_random(self):
        response = self.client.post('/api/book_room', json.dumps({'date': "2024-06-15", 'time': "09:00"}), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    # Test that check we are getting 400 when there are no available rooms
    def test_book_room_no_availability(self):
        self.client.post('/api/book_room', json.dumps({'date': "2024-06-15", 'time': "09:00"}), content_type='application/json')
        self.client.post('/api/book_room', json.dumps({'date': "2024-06-15", 'time': "09:00"}),  content_type='application/json')
        response = self.client.post('/api/book_room', json.dumps({'date': "2024-06-15", 'time': "09:00"}),  content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'No available room for the selected date and time')

    # Test that tries to cancel a booking for a specific room (room_1) and see there are no more schedules
    def test_cancel_booking(self):
        response = self.client.delete(f'/api/cancel_booking?room_id={self.room1.id}&booking_id={self.booking.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Booking.objects.filter(room=self.room1).count(), 0)

    # Test that tries to cancel a booking for a specific room that does not exist
    def test_cancel_booking_not_found(self):
        response = self.client.delete(f'/api/cancel_booking?room_id={self.room1.id}&booking_id=999')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Test that tries to add a room
    def test_add_room(self):
        response = self.client.post('/api/add_room', json.dumps({'name': "Room 3"}),  content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Room.objects.count(), 3)

    # Test that tries to add a room that already exist
    def test_add_room_already_exists(self):
        response = self.client.post('/api/add_room', json.dumps({'name': "Room 1"}),  content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Room Room 1 already exists.')

    # Test that tries to delete a room
    def test_delete_room(self):
        response = self.client.delete(f'/api/delete_room?room_id={self.room1.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Room.objects.count(), 1)

    # Test that tries to delete a room that does not exist
    def test_delete_room_not_found(self):
        response = self.client.delete('/api/delete_room?room_id=999')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
