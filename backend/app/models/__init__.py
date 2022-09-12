# Mixins
from .BaseModel import BaseModel
from .EnumerationMixin import EnumerationMixin
from .SearchableMixin import SearchableMixin

# Enumerations
from .Exposition import Exposition
from .Family import Family
from .OpenData import OpenData
from .Organization import Organization
from .Origin import Origin
from .Sensibility import Sensibility
from .Type import Type
from .UpdateFrequency import UpdateFrequency
from .Tag import Tag

# Main classes
from .User import User
from .Application import Application
from .DataSource import DataSource

# Associations
from .Application import ownerships

# Other
from .WildCard import WildCard


def get_enumeration_model_by_name(name):
    if name.lower() == "type":
        return Type
    elif name.lower() == "family":
        return Family
    elif name.lower() == "organization":
        return Organization
    elif name.lower() == "sensibility":
        return Sensibility
    elif name.lower() == "classification":
        return Family
    elif name.lower() == "exposition":
        return Exposition
    elif name.lower() == "referentiel":
        return Family
    elif name.lower() == "open_data":
        return OpenData
    elif name.lower() == "update_frequency":
        return UpdateFrequency
    elif name.lower() == "origin":
        return Origin
    elif name.lower() == "tag":
        return Tag


def get_enumeration_type_by_name(name):
    if name.lower() == "type":
        return 'single'
    elif name.lower() == "family":
        return 'multiple'
    elif name.lower() == "organization":
        return 'single'
    elif name.lower() == "sensibility":
        return 'single'
    elif name.lower() == "classification":
        return 'multiple'
    elif name.lower() == "exposition":
        return 'multiple'
    elif name.lower() == "referentiel":
        return 'single'
    elif name.lower() == "open_data":
        return 'single'
    elif name.lower() == "update_frequency":
        return 'single'
    elif name.lower() == "origin":
        return 'single'
    elif name.lower() == "tag":
        return 'multiple'
