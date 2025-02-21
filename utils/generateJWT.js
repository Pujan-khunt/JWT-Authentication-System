import "dotenv/config";

export const generateTokens = (user) => {
  // Create an access token to send to the user.
  const accessToken = jwt.sign(
    {
      id: user._id,
      username: user.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  // Create an refresh token to save in the DB.
  const refreshToken = jwt.sign(
    {
      username: user.username
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}