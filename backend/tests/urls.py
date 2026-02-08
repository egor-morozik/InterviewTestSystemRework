from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TestViewSet

router = DefaultRouter()

router.register(r"tests", TestViewSet, basename="tests")

urlpatterns = [
    path(
        "api/",
        include(router.urls),
    ),
]
