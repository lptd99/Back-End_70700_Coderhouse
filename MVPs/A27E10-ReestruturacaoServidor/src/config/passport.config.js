import passport from "passport";
import GitHubStrategy from "passport-github2";
import jwt from "passport-jwt";
import local from "passport-local";
import userModel from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

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

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,

        // NÃO peça user:email => não chama /user/emails e não estoura
        scope: ["read:user"],

        // bons headers p/ API moderna do GitHub
        customHeaders: {
          "User-Agent": "Coderhouse-App",
          "X-GitHub-Api-Version": "2022-11-28",
          Accept: "application/vnd.github+json",
        },
        // proxy: true, // se estiver atrás de proxy corporativo
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const provider = "github";
          const providerId = profile.id;

          // NÃO dependemos de e-mail real
          const fallbackEmail = `${
            profile.username || providerId
          }@users.noreply.github.com`;
          const ghEmail =
            profile.emails?.[0]?.value || profile._json?.email || fallbackEmail;

          // 1) tenta por providerId (estável)
          let user = await userModel.findOne({ provider, providerId });

          // 2) se não existir, tenta por email (caso já exista do local)
          if (!user) {
            user = await userModel.findOne({ email: ghEmail });
          }

          // 3) se ainda não existir, cria
          if (!user) {
            user = await userModel.create({
              first_name:
                profile.displayName || profile.username || "GitHubUser",
              last_name: "",
              email: ghEmail, // pode ser noreply, tudo bem
              password: "", // OAuth não usa senha
              role: "user",
              birth: "",
              provider,
              providerId,
            });
          } else {
            // garanta provider/providerId preenchidos
            let touched = false;
            if (!user.provider) {
              user.provider = provider;
              touched = true;
            }
            if (!user.providerId) {
              user.providerId = providerId;
              touched = true;
            }
            if (touched) await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done("Error while authenticating with GitHub: " + error);
        }
      }
    )
  );

  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.COOKIE_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          done(null, jwtPayload);
        } catch (error) {
          done(error);
        }
      }
    )
  );
};

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["authToken"];
  }
  return token;
};

export default initializePassport;
