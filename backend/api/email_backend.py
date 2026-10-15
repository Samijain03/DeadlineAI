"""Resend delivery over HTTPS, including on hosts that block SMTP ports."""
import requests
from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend
from django.core.exceptions import ImproperlyConfigured


class ResendEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        if not settings.RESEND_API_KEY:
            if self.fail_silently:
                return 0
            raise ImproperlyConfigured('RESEND_API_KEY is not configured.')
        sent = 0
        for message in email_messages:
            if not message.recipients():
                continue
            payload = {'from': message.from_email, 'to': message.to,
                       'subject': message.subject, 'text': message.body}
            if message.cc:
                payload['cc'] = message.cc
            if message.bcc:
                payload['bcc'] = message.bcc
            if message.reply_to:
                payload['reply_to'] = message.reply_to
            try:
                response = requests.post('https://api.resend.com/emails',
                    headers={'Authorization': f'Bearer {settings.RESEND_API_KEY}'},
                    json=payload, timeout=10)
                # Do not log provider responses: they may contain recipients or tokens.
                if not response.ok:
                    raise RuntimeError('Email provider rejected this message.')
                sent += 1
            except (requests.RequestException, RuntimeError):
                if not self.fail_silently:
                    raise RuntimeError('Email delivery is temporarily unavailable.') from None
        return sent


def email_ready():
    backend = settings.EMAIL_BACKEND
    if backend == 'api.email_backend.ResendEmailBackend':
        return bool(settings.RESEND_API_KEY and settings.DEFAULT_FROM_EMAIL and '@localhost' not in settings.DEFAULT_FROM_EMAIL)
    if backend == 'django.core.mail.backends.smtp.EmailBackend':
        return bool(settings.EMAIL_HOST)
    # Console/file backends expose reset links and cannot deliver production mail.
    if not settings.DEBUG and backend in {'django.core.mail.backends.console.EmailBackend',
                                         'django.core.mail.backends.filebased.EmailBackend',
                                         'django.core.mail.backends.dummy.EmailBackend'}:
        return False
    return True
