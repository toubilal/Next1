/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb', // زدنا الحجم إلى 4 ميجابايت بدلاً من 1
    },
  },
}

module.exports = nextConfig
