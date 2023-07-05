import jwt from "jsonwebtoken";

function generateAccessToken(user) {
  return jwt.sign({ userId: user.id }, `${process.env.JWT_ACCESS_SECRET}`, {
    expiresIn: "1m",
  });
}

function generateRefreshToken(user, jti) {
  return jwt.sign(
    { userId: user.id, jti },
    `${process.env.JWT_REFRESH_TOKEN}`,
    {
      expiresIn: "8h",
    }
  );
}

function generateTokens(user, jti) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return { accessToken, refreshToken };
}

export { generateAccessToken, generateRefreshToken, generateTokens };
