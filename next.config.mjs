/** @type {import('next').NextConfig} */
const nextConfig = {
  // THE most common "why won't this build" for R3F in Next.js. The three.js
  // ecosystem ships untranspiled ESM add-ons; without this you get a syntax
  // error from inside node_modules and no useful clue as to why.
  transpilePackages: ["three"],
};

export default nextConfig;
