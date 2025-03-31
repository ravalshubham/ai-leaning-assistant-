from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout

def REGISTER(request):
    if request.method == "POST":
        name = request.POST.get('name')
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            messages.warning(request, 'Email Already Exists!')
            return redirect('register')

        # Create user with email as username
        user = User.objects.create_user(username=email, email=email, password=password)
        user.first_name = name  # Store name in first_name field
        user.save()

        messages.success(request, "Registration successful! You can now log in.")
        return redirect('register')

    return render(request, 'registration/register.html')


def DO_LOGIN(request):
    if request.method == "POST":
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Authenticate user
        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            # Check if 'next' parameter exists in GET to handle redirects from password reset
            next_url = request.GET.get('next', 'dashboard')
            return redirect(next_url)  # Redirect to dashboard or next URL
        else:
            messages.error(request, 'Invalid Email or Password!')
            return redirect('login')

    return render(request, 'registration/login.html')




def PROFILE(request):
    return render(request, 'main/profile.html')

def PROFILE_UPDATE(request):
    if request.method == "POST":
        # username = request.POST.get('username')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        user_id = request.user.id

        user = User.objects.get(id=user_id)
        user.first_name = first_name
        user.last_name = last_name
        # user.username = username
        user.email = email

        if password != None and password != "":
            user.set_password(password)
        user.save()
        messages.success(request, 'Profile is sucessfully updated!! ')
    return redirect('profile')

def LOGOUT(request):
    logout(request)
    messages.success(request, 'User Logged out sucessfully !!')
    return redirect('register')