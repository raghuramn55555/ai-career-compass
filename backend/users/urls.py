from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .serializers import EmailTokenObtainPairSerializer
from .views import RegisterView, UserProfileView, ForgotPasswordView, ResetPasswordView, GenerateResumeView, SyncProgressView, AdminUsersView


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', EmailTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('generate-resume/', GenerateResumeView.as_view(), name='generate-resume'),
    path('sync-progress/', SyncProgressView.as_view(), name='sync-progress'),
    path('admin-users/', AdminUsersView.as_view(), name='admin-users'),
]
