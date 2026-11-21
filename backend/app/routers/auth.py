from fastapi import APIRouter, Depends,HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_bd
from app.schemas.user import UserCreate,UserResponse,UserRoleUpdate
from app.services.auth_service import create_user, login_user
from app.utils.security import get_current_user, require_admin 
from app.models.user import User

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_bd)):
    return create_user(db,user)

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_bd)):
    return login_user(db,form_data)

@router.get("/me",response_model=UserResponse)
def get_me(current_user: User =Depends(get_current_user)):
    return current_user

@router.get("/admin/users",response_model=list[UserResponse])
def get_all_users(db:Session=Depends(get_bd),current_user:User = Depends(require_admin)):
    users = db.query(User).all()

    return users 


@router.patch("/admin/users/{user_id}/role",response_model=UserResponse)
def update_user_role(user_id:int,role_data:UserRoleUpdate,db:Session=Depends(get_bd),current_user:User=Depends(require_admin)):
    user = db.query(User).filter(User.id==user_id).first()

    if not user:
        raise HTTPException(status_code=404,detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=400,detail="You cannot change your own admin role")
    
    user.is_admin = role_data.is_admin

    db.commit()
    db.refresh(user)
    
    return user