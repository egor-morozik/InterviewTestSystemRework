from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CandidateViewSet

router = DefaultRouter()

router.register(r"candidates/", CandidateViewSet, basename="candidate")

urlpatterns = [
    path(
        "api/",
        include(router.urls),
    ),
]
