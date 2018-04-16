let express = require('express');
let router = express.Router();
const auth = require('../controller/auth.controller');
const registration = require('../controller/registration.controller');
const userRecord = require('../controller/user.record.controller');
const propertyRecord = require('../controller/property.record.controller');
const entityRecord = require('../controller/entity.record.controller');
const streetRecord = require('../controller/street.record.controller');
const oracle = require('../controller/oracle.controller');

const app = express();

router.post('/authenticate', auth.authenticateUser); //authenticate user
router.post('/user', registration.addUser); //add new user
router.post('/street', streetRecord.addNewStreet); //add new street data
router.post('/property', propertyRecord.addNewProperty); //add new property data
router.post('/entity', entityRecord.addNewEntity); //add new property entity data

//router.get('/analytics', oracle.getAnalytics);

router.get('/make/love/:code', oracle.generateLove); //make love
router.get('/headers', oracle.generateHeaders); //generate headers
router.get('/current/version/:app', oracle.getCurrentVersion); //get app current version

router.get('/user/:id', userRecord.getUser); //single user data
router.get('/users/:start/:limit', userRecord.getUsers); //all users data
router.get('/verify/:email', userRecord.verifyUser); // verify user

router.get('/user/streets/:id', streetRecord.getStreetsByUser); //get all street data by specified user
router.get('/street/:id', streetRecord.getStreet); //single street data
router.get('/streets/:start/:limit', streetRecord.getStreets); //all street data
router.get('/search/streets/:search/:start/:limit', streetRecord.searchStreets); //search all street data

router.get('/street/properties/:id', propertyRecord.getPropertiesByStreet); //properties in specified street
router.get('/property/:id', propertyRecord.getProperty); //single property data
router.get('/properties/:start/:limit', propertyRecord.getProperties); //all properties data

router.get('/all/properties', propertyRecord.getAllProperties); //all properties data for Admin
router.get('/all/streets', streetRecord.getAllStreets); //all streets data for Admin

router.get('/entity/:id', entityRecord.getEntity); //single entity
router.get('/entities/:start/:limit', entityRecord.getEntities); //all property entities
router.get('/property/entities/:id', entityRecord.getPropertyEntities); //single property entities

router.patch('/user', userRecord.patchUser); //update user
router.patch('/user/avatar', userRecord.patchAvatar); //update user avatar
router.patch('/user/onesignal', userRecord.patchUserPlayerId); //update user OneSignal Player ID
router.patch('/user/security', userRecord.patchUserSecurity); //update user password

//router.patch('/street', streetRecord.patchStreet); //update street data
//router.patch('/property', propertyRecord.patchProperty); //update property data

router.patch('/street/photo', streetRecord.patchStreetPhoto); //update street photo
router.patch('/property/photo', propertyRecord.patchPropertyPhoto); //update property photo
router.patch('/entity/photo', entityRecord.patchEntityPhoto); //update property entity photo

router.delete('/user/:id', userRecord.deleteUser); //update new user
router.delete('/street/:id', streetRecord.deleteStreet); //update street data
router.delete('/property/:id', propertyRecord.deleteProperty); //update property data

module.exports = router;
