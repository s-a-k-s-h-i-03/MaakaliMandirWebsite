const requiredEnvironmentVariables = ["VITE_API_BASE_URL"];

const missingEnvironmentVariables = requiredEnvironmentVariables.filter((name) => !process.env[name]);

if (missingEnvironmentVariables.length > 0) {
  console.error(
    `Missing required build environment variable(s): ${missingEnvironmentVariables.join(", ")}`,
  );
  process.exit(1);
}
