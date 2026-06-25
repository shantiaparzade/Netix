from django.shortcuts import render, redirect
from .models import Contact

def index(request):
    if request.method == 'POST':
        Contact.objects.create(
            name=request.POST.get('name'),
            email=request.POST.get('email'),
            phone=request.POST.get('phone'),
            request_type=request.POST.get('request_type'),
            message=request.POST.get('message')
        )
        return redirect('home')

    return render(request, 'index.html')