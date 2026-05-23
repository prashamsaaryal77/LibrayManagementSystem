/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    DAILY_FINE_AMOUNT: process.env.DAILY_FINE_AMOUNT,
    BORROW_LIMIT: process.env.BORROW_LIMIT,
  },
}

export default nextConfig
