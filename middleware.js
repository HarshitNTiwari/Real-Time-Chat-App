import jwt from "jsonwebtoken";

function isAuthenticated(req, res, next) {
  console.log(req.headers);
  // const { authorization } = req.headers;

  // if (!authorization) {
  //   // res.status(401);
  //   // throw new Error('User unauthorized!');
  //   res.redirect("/login");
  // }

  try {
    // console.log(authorization);
    // const token = authorization.split(" ")[1];
    const token = req.cookies?.accessToken;
    if (!token) res.redirect("/login");
    console.log(token);
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log(payload);
  } catch (err) {
    // res.status(401);
    if (err.name == "TokenExpiredError") {
      res.redirect("/login");
      // throw new Error(err.name);
    }
    // throw new Error("User unauthorized!");
  }
  console.log("At the end of middleware");
  return next();
}

function isNotAlreadyloggedin(req, res, next) {
  console.log("in isNotAlreadyloggedin middleware");
  try {
    const token = req.cookies?.accessToken;
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      res.redirect("/create-chat");
    }
  } catch (err) {
    return next();
  }
  return next();
}

export { isAuthenticated, isNotAlreadyloggedin };
