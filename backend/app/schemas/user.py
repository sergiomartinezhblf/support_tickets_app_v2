from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str 
    email: str 
    password: str

class UserResponse(BaseModel):
    id: int 
    username: str 
    email: str 
    is_admin: bool

class UserLogin(BaseModel):
    email: str
    password: str

class UserRoleUpdate(BaseModel):
    is_admin: bool
