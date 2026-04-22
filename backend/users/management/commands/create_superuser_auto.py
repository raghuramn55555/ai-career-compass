from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create superuser automatically for production'

    def handle(self, *args, **kwargs):
        email = 'admin@aicareercompass.com'
        username = 'admin'
        password = 'Admin@1234'

        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(f'Superuser created: {email} / {password}')
        else:
            self.stdout.write(f'Superuser already exists: {email}')
