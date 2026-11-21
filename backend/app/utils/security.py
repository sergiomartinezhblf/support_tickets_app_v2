from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_bd
from app.models.user import User

load_dotenv()

SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM=os.getenv("ALGORITHM")

print("ALGORITHM",ALGORITHM)
print("SECRET_KEY cargada",bool(SECRET_KEY))


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(password:str)->str:
    return pwd_context.hash(password)

def verify_password(password:str,hashed_password:str)->bool:
    return pwd_context.verify(password,hashed_password)

def create_access_token(data:dict):
    to_encode=data.copy()

    expire = datetime.utcnow() + timedelta(minutes=30)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt

def get_current_user(
    token: str= Depends(oauth2_scheme),
    db: Session= Depends(get_bd)
):

     print(">>>>>get_current_user EJECUTADO")
     print(">>>>>token recibido",bool(token))
     print(">>>>>longitud del token",len(token))
     print(">>>>>primeros 10 caracteres",token[:10])
     print(">>>>>ultimos 10 caracteres",token[-10:])
     credentials_exception = HTTPException(
        status_code=401,
        detail = "Could not validate credentials"
     )

     try:
        print("validandot token con algoritmo",ALGORITHM)
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:
            raise credentials_exception
        
     except JWTError as error:
        print("ERROR JWT",error)
        raise credentials_exception
    
     user = db.query(User).filter(User.email==email).first()

     if user is None:
        raise credentials_exception

     return user 

def require_admin(
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403,detail="Admin privileges required")
    
    return current_user
