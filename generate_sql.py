from backend.app import create_app
from backend.app.extensions import db
from sqlalchemy.schema import CreateTable

app = create_app()
with app.app_context():
    for table in db.metadata.sorted_tables:
        print(CreateTable(table).compile(dialect=db.engine.dialect))
        print(";")
