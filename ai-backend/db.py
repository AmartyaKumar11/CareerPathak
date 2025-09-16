from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

DATABASE_URL = "postgresql://user:password@localhost:5432/careerpathak"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    marks = relationship("Marksheet", back_populates="user")
    answers = relationship("PsychometricAnswer", back_populates="user")

class Marksheet(Base):
    __tablename__ = "marksheets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    subject = Column(String)
    marks = Column(Integer)
    max_marks = Column(Integer)
    confidence = Column(Float)
    user = relationship("User", back_populates="marks")

class PsychometricAnswer(Base):
    __tablename__ = "psychometric_answers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    question_id = Column(String)
    answer = Column(String)
    question_text = Column(Text)
    user = relationship("User", back_populates="answers")

# To create tables:
# from db import Base, engine
# Base.metadata.create_all(bind=engine)
