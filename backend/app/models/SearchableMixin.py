from typing import Dict

from sqlalchemy import inspect
from app import db
from app.search import add_to_index, remove_from_index, \
    query_index_with_filter, query_count, remove_all_from_index, \
    bulk_add_to_index, set_default_analyzer
from app.search.enums import Strictness


class SearchableMixin(object):
    @classmethod
    def search_with_filter(
            cls,
            query: str,
            filters_dict: Dict,
            strictness: Strictness,
            page: int,
            per_page: int,
            exclusions: str = "",
    ):
        ids, total_count = query_index_with_filter(
            cls.__tablename__,
            query,
            filters_dict,
            strictness,
            exclusions,
            cls.__searchable__,
            page,
            per_page,
        )
        if total_count == 0:
            return [], 0
        when = []
        for i in range(len(ids)):
            when.append((ids[i], i))
        return cls.query.filter(cls.id.in_(ids)).order_by(
            db.case(when, value=cls.id)).all(), total_count

    @classmethod
    def query_count(
            cls,
            query: str,
            filters_dict: Dict,
            strictness: Strictness,
            exclusions: str,
    ):
        return query_count(
            cls.__tablename__,
            query,
            filters_dict,
            strictness,
            exclusions,
            cls.__searchable__,
            cls.__search_count__,
        )

    @classmethod
    def before_commit(cls, session):
        session._changes = {
            'add': list(session.new),
            'update': list(session.dirty),
            'delete': list(session.deleted)
        }

    @classmethod
    def reindex(cls):
        inspector = inspect(db.engine)
        if cls.__tablename__ in inspector.get_table_names():
            remove_all_from_index(cls.__tablename__)
            set_default_analyzer(cls.__tablename__)
            bulk_add_to_index(cls.__tablename__, cls.query.all())

    @classmethod
    def add_to_index(cls, model):
        add_to_index(cls.__tablename__, model)

    @classmethod
    def remove_from_index(cls, model):
        remove_from_index(cls.__tablename__, model)


db.event.listen(db.session, 'before_commit', SearchableMixin.before_commit)
