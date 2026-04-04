# backend/fees/views.py
from rest_framework import viewsets
from .models import FeeStructure, Payment
from .serializers import FeeStructureSerializer, PaymentSerializer


class FeeStructureViewSet(viewsets.ModelViewSet):

    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related(
        'student',
        'fee'
    )
    serializer_class = PaymentSerializer
