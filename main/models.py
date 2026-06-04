from django.db import models


class Contact(models.Model):
    REQUEST_TYPES = [
        ('مشاوره رایگان', 'مشاوره رایگان'),
        ('درخواست پروژه', 'درخواست پروژه'),
        ('سایر موارد', 'سایر موارد'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    request_type = models.CharField(max_length=50, choices=REQUEST_TYPES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name