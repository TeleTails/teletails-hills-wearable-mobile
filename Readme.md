
## make sure latest env variables and build number are updated with the following command
npx expo prebuild

## build app 
eas build --platform ios --profile development

## upload to TestFlight (doesn't actually 'submit' the app for review)
eas submit -p ios --latest