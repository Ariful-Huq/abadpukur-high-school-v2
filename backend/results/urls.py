# backend/results/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MarkViewSet, ExamViewSet

router = DefaultRouter()
router.register(r'marks', MarkViewSet)
router.register(r'exams', ExamViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
