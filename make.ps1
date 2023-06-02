if (Test-Path -Path: C:\Games\DEV\user\mods\AWM\) {
    Remove-Item -Recurse -Force C:\Games\DEV\user\mods\AWM\ | Out-Null
}
Copy-Item -Recurse -Path .\ -Destination C:\Games\DEV\user\mods\ | Out-Null
Remove-Item C:\Games\DEV\user\mods\AWM\make.ps1 | Out-Null
Set-Location C:\Games\DEV\ | Out-Null
Start-Process powershell {./Aki.Server.exe}
Start-Process powershell {./Aki.Launcher.exe}
Set-Location C:\Users\TheEyeOfAr3s\Documents\coding\SPTarkov\AWM\ | Out-Null