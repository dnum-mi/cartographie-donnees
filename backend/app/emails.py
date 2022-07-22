from threading import Thread
from flask_mail import Message
from flask import current_app
from app import mail


def send_async_email(application, msg):
    with application.app_context():
        try:
            mail.send(msg)
        except ConnectionRefusedError:
            raise Exception("The mail server is not working")


def send_email(subject, recipients, text_body, html_body):
    msg = Message(subject, recipients=recipients)
    msg.body = text_body
    msg.html = html_body
    Thread(target=send_async_email, args=(current_app, msg)).start()
