@echo off
echo Starting CyberVault MongoDB Server on 127.0.0.1:27017...
start "" "C:\Users\nethm\mongodb\MongoDB\Server\9.0\bin\mongod.exe" --config "C:\Users\nethm\mongodb\mongod.cfg"
echo MongoDB Server started.
