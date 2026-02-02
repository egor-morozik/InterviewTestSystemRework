from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdminAttemptViewSet, CandidateAttemptViewSet

router = DefaultRouter()

router.register(
    r"admin_attempts",
    AdminAttemptViewSet,
    basename="admin_attempt",
)

router.register(
    r"candidate_attempts",
    CandidateAttemptViewSet,
    basename="candidate_attempt",
)

urlpatterns = [
    path(
        "api/",
        include(router.urls),
    ),
]
