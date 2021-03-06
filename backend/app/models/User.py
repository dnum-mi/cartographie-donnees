from sqlalchemy.orm import validates
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from app import db
from app.models import BaseModel


class User(UserMixin, BaseModel):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False, unique=True)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)

    def __repr__(self):
        return '<User {} {}>'.format(self.first_name, self.last_name)

    def set_password(self, password):
        assert len(password) >= 8
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @validates('email')
    def validate_context_email(self, key, email):
        assert email and '@' in email, "L'adresse email est incorrecte"
        return email

    @validates('is_admin')
    def validate_is_admin(self, key, is_admin):
        if isinstance(is_admin, bool):
            return is_admin
        else:
            raise ValueError("Administrateur ? doit être un booléen")

    def to_dict(self, populate_applications=False):
        result = {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'is_admin': self.is_admin,
        }
        if populate_applications:
            result['applications'] = [application.to_dict() for application in self.applications]
        return result

    def to_export(self):
        initial_dict = self.to_dict()
        del initial_dict["id"]
        # Export password hash in CSV file
        initial_dict['password_hash'] = self.password_hash
        return initial_dict

    def update_from_dict(self, data):
        self.first_name = data.get('first_name')
        self.last_name = data.get('last_name')
        self.email = data.get('email')
        self.is_admin = data.get('is_admin', False)

    @staticmethod
    def from_dict(data):
        return User(
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            email=data.get('email'),
            # Do not enable to create a user with is_admin=True
        )
