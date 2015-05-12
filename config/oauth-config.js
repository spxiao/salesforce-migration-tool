"use strict";

module.exports = {
  provider: {
    protocol: process.env.OAUTH_HOST_PROTOCOL || "http",
    //host: "localhost:3000",
    host: process.env.OAUTH_HOST_NAME || "express-test-itb.herokuapp.com111",
    profileUrl: "/api/userinfo"
  },
  consumer: {
    protocol: process.env.HOST_PROTOCOL || "http",
    host:  process.env.HOST_NAME ||"migrationtool-staging.herokuapp.com111"
  }
};
