from django.contrib import admin
from .models import Contact


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'phone',
        'email',
        'request_type',
        'created_at'
    )

    search_fields = (
        'name',
        'phone',
        'email'
    )

    list_filter = (
        'request_type',
        'created_at'
    )