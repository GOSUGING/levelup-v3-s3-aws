@echo off
SET REPO=865742897789.dkr.ecr.eu-north-1.amazonaws.com/frontend

echo ============================
echo BUILD FRONTEND
echo ============================
docker build -t frontend .

echo ============================
echo TAG
echo ============================
docker tag frontend:latest %REPO%:latest

echo ============================
echo PUSH
echo ============================
docker push %REPO%:latest

echo Frontend desplegado correctamente.
pause
