from DB.connectDB import DB
from DB.Tables.authTable import User
from sqlalchemy import select
class UserRepo:
    def __init__(self):
        self.db = DB()
        self.session = self.db.return_session()
    def add_user(self,user):
        try:
            self.session.add(user)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            print(f"Error adding user: {e}")
            raise e
    def get_user_by_id(self,user_id):
        try:
            return self.session.query(User).filter_by(id=user_id).first()
        except Exception as e:
            print(f"Error retrieving user by id: {e}")
            raise e
    def get_user_by_email(self,email) -> User | None :
        try:
            return self.session.query(User).filter_by(email=email).first() 
        except Exception as e:
            print(f"Error retrieving user by email: {e}")
            raise e
    def update_user(self,user : User):
        try:
            updated_user = self.session.merge(user)
            self.session.commit()
            return updated_user
        except Exception as e:
            self.session.rollback()
            print(f"Error updating user: {e}")
            raise e
    def delete_user(self,user):
        try:
            self.session.delete(user)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            print(f"Error deleting user: {e}")
            raise e
    