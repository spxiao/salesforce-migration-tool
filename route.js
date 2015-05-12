"use strict";

var userAuthFilter = require("./filter/userAuthFilter"),
  user = require("./controller/user"),
  accountManager = require("./controller/accountManager"),
  changeSetManager = require("./controller/changeSetManager"),
  site = require("./controller/site");

var passport = require("passport");

module.exports = function(app) {
  // user login
  app.get("/", userAuthFilter.redirectToHomePageIfAlreadyLoggedIn, user.showloginForm);
  app.get("/auth/example-oauth2orize", passport.authenticate("itbsso", { scope: ["email"] }));
  app.get("/auth/example-oauth2orize/callback",
    passport.authenticate("itbsso", { 
      failureRedirect: "/", 
      failureFlash: "Login failed, please contact the administrator."
    }),
    user.login
  );
  app.get("/user/logout", user.logout);

  app.get("/authcallback",accountManager.authcallback);

  //sfconn manage routes
  app.all(/^\/sfconn(\w)*/, userAuthFilter.checkLogin);
  app.get("/sfconn",accountManager.listAccount);
  app.post("/sfconn",accountManager.addAccount);

  app.param("sfconnId",accountManager.load);
  app.get("/sfconn/:sfconnId",accountManager.listAccountInfo);
  app.put("/sfconn/:sfconnId",accountManager.updateAccount);
  app.delete("/sfconn/:sfconnId",accountManager.deleteAccount);

  app.post("/sfconn/validate",accountManager.validateAccount);
  app.post("/sfconn/syncFile/:sfconnId",accountManager.syncAccountFile);

  app.post("/sfconn/:sfconnId/analyzeCSV",accountManager.analyzeCSV);
  
  app.get("/sfconn/:sfconnId/changeSets",changeSetManager.changeSetInit);
  app.post("/sfconn/:sfconnId/changeSets",changeSetManager.changeSetSave);
  app.get("/sfconn/:sfconnId/changeSets/:changeSetId",changeSetManager.changeSetInfo);
  app.delete("/sfconn/:sfconnId/changeSets/:changeSetId",changeSetManager.changeSetDelete);



  app.all(/^\/changeSet(\w)*/, userAuthFilter.checkLogin);
  // todo: determine if these still need, if not we then remove them
  app.post("/changeSets/:changeSetId/archives",changeSetManager.addArchive);
  app.post("/changeSets/:changeSetId/validation",changeSetManager.addValidation);
  app.post("/changeSets/:changeSetId/deployment",changeSetManager.addDeployment);

  //app.get("/changeSet/archive/:archiveId",changeSetManager.viewArchive);
  app.delete("/changeSet/archive/:archiveId",changeSetManager.deleteArchive);
  //app.get("/changeSet/validation/:validationId",changeSetManager.viewValidation);
  app.delete("/changeSet/validation/:validationId",changeSetManager.deleteValidation);
  //app.get("/changeSet/deployment/:deploymentId",changeSetManager.viewDeployment);
  app.delete("/changeSet/deployment/:deploymentId",changeSetManager.deleteDeployment);

  app.all(/^\/archive(\w)*/,userAuthFilter.checkLogin);
  app.param("archiveId",changeSetManager.loadArchive);
  app.get("/archive/:archiveId/download",changeSetManager.downloadArchiveFile);

  app.get("/checkStatus",userAuthFilter.checkLogin,site.checkStatus);

  //wiki
  app.get("/wiki",userAuthFilter.checkLogin, user.wiki);
};