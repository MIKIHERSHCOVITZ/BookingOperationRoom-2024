import json
import random

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room, Booking
from .serializers import RoomSerializer, BookingSerializer


# GET api to retrieve all rooms
@api_view(['GET'])
def get_rooms(request):
    rooms = Room.objects.all()
    serializer = RoomSerializer(rooms, many=True)
    return Response(serializer.data)


# GET api to retrieve a schedule of a specific room
@api_view(['GET'])
def get_room_schedule(request):
    # Takes the room_id from the request
    room_id = request.GET.get('room_id')

    # if room_id does not exist return 400
    if not room_id:
        return Response({'error': 'Room ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    # try to get the room object
    try:
        room = Room.objects.get(pk=room_id)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

    # get all the bookings for the room
    bookings = room.bookings.all()
    if not bookings:
        return Response({'message': 'No bookings found for this room'}, status=status.HTTP_200_OK)

    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


# POST api to book a room
@api_view(['POST'])
def book_room(request):
    # take all parameters from request
    request_data = json.loads(request.body)
    date = request_data.get('date')
    time = request_data.get('time')
    room_id = request_data.get('room_id')

    # If there is a room_id the request came from CalenderView in the front, so we would book a specific room
    if room_id:
        # tries to get the room object
        try:
            room = Room.objects.get(pk=room_id)
        except Room.DoesNotExist:
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

        # I copy the data from the request and modify it to fit the serializer
        data = request_data.copy()
        data["room"] = room_id
        data.pop("room_id")

        # creates a booking object
        serializer = BookingSerializer(data=data)
        if serializer.is_valid():
            # connect the schedule booked to the specific room
            serializer.save(room=room)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # If there is no room_id the request came from BookingForm in the front, so we would book a random room
    else:
        # Checks which room is available
        available_rooms = []
        for room in Room.objects.all():
            if not room.bookings.filter(date=date, time=time).exists():
                available_rooms.append(room)
        # If no available room, return 400 to notify the user
        if not available_rooms:
            return Response({'error': 'No available room for the selected date and time'},
                            status=status.HTTP_400_BAD_REQUEST)

        # If there is available room, chose a random one and book the schedule to it
        selected_room = random.choice(available_rooms)
        booking = Booking(room=selected_room, date=date, time=time)
        booking.save()

        return Response({'message': f'Room {selected_room.name} booked successfully for {date} at {time}'},
                        status=status.HTTP_200_OK)


# DELETE api to delete a specific booking
@api_view(['DELETE'])
def cancel_booking(request):
    # takes the parameters from the request, if they are missing return 400
    room_id = request.GET.get('room_id')
    booking_id = request.GET.get('booking_id')
    if not room_id or not booking_id:
        return Response({'error': 'Room ID and Booking ID are required'}, status=status.HTTP_400_BAD_REQUEST)

    # takes the relevant booking, then delete it
    try:
        booking = Booking.objects.get(pk=booking_id, room_id=room_id)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

    booking.delete()
    return Response({'message': 'Booking cancelled'}, status=status.HTTP_200_OK)


# POST api to add a room
@api_view(['POST'])
def add_room(request):
    # takes the name of the room
    request_data = json.loads(request.body)
    name = request_data.get('name')
    if name:
        # if room already exist, return 400, else create a new room object
        if Room.objects.filter(name=name).exists():
            return Response({'error': f'Room {name} already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        room = Room(name=name)
        room.save()
        return Response({'id': room.id, 'message': f'Room {name} added successfully.'}, status=status.HTTP_200_OK)
    return Response({'error': 'Name is required.'}, status=status.HTTP_400_BAD_REQUEST)


# DELETE api to delete a specific room
@api_view(['DELETE'])
def delete_room(request):
    # takes the id of the room
    room_id = request.query_params.get('room_id')
    if not room_id:
        return Response({'error': 'Room ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # if room id exist, delete it
        room = Room.objects.get(id=room_id)
        room.delete()
        return Response({'message': f'Room {room.name} deleted successfully.'}, status=status.HTTP_200_OK)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
