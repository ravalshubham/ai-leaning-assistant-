from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class UserSecurityQuestion(models.Model):
    SECURITY_QUESTIONS = [
        ('hero', 'Who is your favorite hero?'),
        ('food', 'What is your favorite food?'),
        ('city', 'In which city were you born?'),
        ('pet', 'What was the name of your first pet?'),
        ('school', 'What was the name of your first school?'),
        ('email', 'What is your email address?'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    question = models.CharField(max_length=50, choices=SECURITY_QUESTIONS)
    answer = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.user.email}'s Security Question"
