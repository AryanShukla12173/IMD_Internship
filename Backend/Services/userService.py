from DB.connectDB import DB
from DB.Tables.authTable import User
from DB.Repo.UserRepo import UserRepo
class userService():
    def __init__(self) -> None:
        self.userRepo = UserRepo()

    def create_user(self, user_obj: User) -> bool:
        try:
            self.userRepo.add_user(user_obj)
            return True
        except Exception as e:
            print(f"Error in Creating User : {str(e)}")
            raise e

    def find_user(self,email : str) -> User | None :
        try:
            if len(email) == 0:
                return None
            return self.userRepo.get_user_by_email(email=email)
        except Exception as e:
            print(f"Error in Finding User : {str(e)}")
            raise e
    def update_user(self,user_obj : User) -> bool:
        try:
            if self.userRepo.update_user(user_obj).id:
                return True
            else:
                return False
        except Exception as e:
            print(f"Exception in Updating User : {str(e)}")
            raise e