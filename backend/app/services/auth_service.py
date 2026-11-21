from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.utils.security import hash_password, verify_password, create_access_token

def create_user(db: Session, user: UserCreate):

    existing_user = (db.query(User).filter(User.email==user.email).first())

    print("="*40)
    print("Email recibido:", user.email)
    print("Usuario encontrado", existing_user)
    print("="*40)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email alredy registered"
        )

    new_user = User(
        username = user.username,
        email = user.email,
        hashed_password = hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email
    }

def login_user(db:Session, user:OAuth2PasswordRequestForm):

    existing_user = (db.query(User).filter(User.email==user.username).first())

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    if not verify_password(user.password,existing_user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token= create_access_token(
        data={"sub": existing_user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }