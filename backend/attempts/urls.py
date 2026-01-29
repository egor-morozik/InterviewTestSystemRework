from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AttemptViewSet, TabSwitchCreateView

router = DefaultRouter()

router.register(r"attempts", AttemptViewSet, basename="attempt")

urlpatterns = [
    path(
        "api/attempts/<uuid:unique_link>/log/", 
        TabSwitchCreateView.as_view(),
        name="attempt-log"
    ),
    path(
        "api/",
        include(router.urls),
    ),
]
