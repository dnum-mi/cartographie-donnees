from sqlalchemy import inspect
from app import db
from app.search import add_to_index, remove_from_index, query_index, query_index_with_filter, query_count, remove_all_from_index


class SearchableMixin(object):
    @classmethod
    def search(cls, expression, page, per_page):
        ids, total = query_index(cls.__tablename__, expression, cls.__searchable__, page, per_page)
        if total == 0:
            return cls.query.filter_by(id=0), 0
        when = []
        for i in range(len(ids)):
            when.append((ids[i], i))
        return cls.query.filter(cls.id.in_(ids)).order_by(
            db.case(when, value=cls.id)), total

    @classmethod
    def search_with_filter(cls, expression, fields, values, page, per_page):
        ids, total, total_count = query_index_with_filter(cls.__tablename__, expression, fields, values, cls.__searchable__, page, per_page)
        if total == 0:
            return cls.query.filter_by(id=0), 0, total_count
        when = []
        for i in range(len(ids)):
            when.append((ids[i], i))
        return cls.query.filter(cls.id.in_(ids)).order_by(
            db.case(when, value=cls.id)), total, total_count

    @classmethod
    def query_count(cls, expression, fields, values, field):
        return query_count(cls.__tablename__, expression, fields, values, cls.__searchable__, field)

    @classmethod
    def before_commit(cls, session):
        session._changes = {
            'add': list(session.new),
            'update': list(session.dirty),
            'delete': list(session.deleted)
        }

    @classmethod
    def after_commit(cls, session):
        for obj in session._changes['add']:
            if isinstance(obj, SearchableMixin):
                add_to_index(obj.__tablename__, obj)
        for obj in session._changes['update']:
            if isinstance(obj, SearchableMixin):
                add_to_index(obj.__tablename__, obj)
        for obj in session._changes['delete']:
            if isinstance(obj, SearchableMixin):
                remove_from_index(obj.__tablename__, obj)
        session._changes = None

    @classmethod
    def reindex(cls):
        inspector = inspect(db.engine)
        if cls.__tablename__ in inspector.get_table_names():
            remove_all_from_index(cls.__tablename__)
            for obj in cls.query:
                add_to_index(cls.__tablename__, obj)

    @classmethod
    def add_to_index(cls, model):
        add_to_index(cls.__tablename__, model)

    @classmethod
    def remove_from_index(cls, model):
        remove_from_index(cls.__tablename__, model)


db.event.listen(db.session, 'before_commit', SearchableMixin.before_commit)
# db.event.listen(db.session, 'after_commit', SearchableMixin.after_commit)
