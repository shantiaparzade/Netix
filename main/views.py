from django.shortcuts import render, redirect
from .models import Contact


def index(request):
    # داده‌های پروژه‌ها
    projects = [
        {"name": "پیکربندی شبکه لابراتوآر آموزشی", "desc": "تجهیز و پیکربندی 100 گره ویندوزی و شبکه سازی",
         "tags": ["راه اندازی"]},
        {"name": "عیب یابی سیستم های شرکتی",
         "desc": "بررسی عیوب نرم افزاری و سخت افزاری واحد های فنی، حسابداری و مدیریتی",
         "tags": ["پشتیبانی فنی", "HelpDesk"]},
        {"name": "برون سپاری پلتفرم هوشمند طراحی صنایع کارخانجات گرانول",
         "desc": "مشاوره، طراحی سناریو و مذاکره به جهت برون سپاری سامانه مدیریتی",
         "tags": ["DevOps", "برون سپاری", "خدمات ابری", "مشاوره"]}
    ]

    if request.method == 'POST':
        Contact.objects.create(
            name=request.POST.get('name'),
            email=request.POST.get('email'),
            phone=request.POST.get('phone'),
            request_type=request.POST.get('request_type'),
            message=request.POST.get('message')
        )
        return redirect('home')

    # ارسال projects به template
    return render(request, 'index.html', {'projects': projects})