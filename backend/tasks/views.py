from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Task
from .serializers import TaskSerializer
from .permissions import IsOwner


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_completed']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user)
