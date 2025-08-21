import passport from "passport";
import GitHubStrategy from "passport-github2";
import local from "passport-local";
import userModel from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";
const LocalStrategy = local.Strategy;

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { first_name, last_name, email, birth } = req.body;
        try {
          let user = await userModel.findOne({ email: username });
          if (user) {
            console.log("User already exists");
            return done(null, false);
          }
          const newUser = {
            first_name,
            last_name,
            email,
            birth,
            password: createHash(password),
          };
          let result = await userModel.create(newUser);
          return done(null, result);
        } catch (error) {
          return done("Erro ao obter usuário: " + error);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          const user = await userModel.findOne({ email: username });
          if (!user) {
            console.log("User not found");
            return done(null, false);
          }
          console.log(user);
          console.log(password);

          if (!isValidPassword(user, password)) {
            console.log("Invalid password");
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done("Error while logging in: " + error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // GitHub Login Strategy
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await userModel.findOne({
            email: profile._json.email,
          });
          if (!user) {
            console.log("User not found, creating a new one");
            console.log(profile);
            console.log(profile._json);
            const newUser = {
              first_name: profile._json.name,
              last_name: "",
              email: profile._json.email,
              password: "",
              role: "user",
              birth: "",
            };
            let result = await userModel.create(newUser);
            done(null, result);
          }
          done(null, user);
        } catch (error) {
          done("Error while authenticating with GitHub: " + error);
        }
      }
    )
  );
};

export default initializePassport;
